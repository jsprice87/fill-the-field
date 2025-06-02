interface GeocodingResult {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface CachedGeocodingData {
  results: Record<string, GeocodingResult | null>;
  timestamp: number;
  franchiseeId: string;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = 'free_geocoding_';
const REQUEST_TIMEOUT = 5000; // 5 second timeout per request
const REQUEST_DELAY = 200; // Reduced delay between requests
const MAX_CONCURRENT = 2; // Maximum concurrent requests
const MAX_FAILURES = 3; // Stop after 3 consecutive failures

// Get cache key for a franchisee
const getCacheKey = (franchiseeId: string) => `${CACHE_KEY_PREFIX}${franchiseeId}`;

// Create address string for geocoding
const formatAddress = (location: Location): string => {
  return `${location.address}, ${location.city}, ${location.state} ${location.zip}, USA`;
};

// Load cached geocoding results
const loadCachedResults = (franchiseeId: string): Map<string, GeocodingResult | null> => {
  try {
    const cacheKey = getCacheKey(franchiseeId);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      console.log('No cached geocoding data found');
      return new Map();
    }

    const parsedCache: CachedGeocodingData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - parsedCache.timestamp > CACHE_DURATION) {
      console.log('Cached geocoding data expired, clearing cache');
      localStorage.removeItem(cacheKey);
      return new Map();
    }

    // Convert object back to Map
    const resultsMap = new Map<string, GeocodingResult | null>();
    Object.entries(parsedCache.results).forEach(([key, value]) => {
      resultsMap.set(key, value);
    });
    
    console.log(`Loaded ${resultsMap.size} cached geocoding results`);
    return resultsMap;
  } catch (error) {
    console.error('Error loading cached geocoding results:', error);
    return new Map();
  }
};

// Save geocoding results to cache
const saveCachedResults = (franchiseeId: string, results: Map<string, GeocodingResult | null>) => {
  try {
    const cacheKey = getCacheKey(franchiseeId);
    const cacheData: CachedGeocodingData = {
      results: Object.fromEntries(results),
      timestamp: Date.now(),
      franchiseeId
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached ${results.size} geocoding results for franchisee ${franchiseeId}`);
  } catch (error) {
    console.error('Error saving geocoding results to cache:', error);
  }
};

// Create a timeout wrapper for fetch requests
const fetchWithTimeout = async (url: string, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Geocode using OpenStreetMap Nominatim with timeout
const geocodeWithNominatim = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`,
      REQUEST_TIMEOUT
    );
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      geocodingCircuitBreaker.recordSuccess();
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    geocodingCircuitBreaker.recordFailure();
    if (error.name === 'AbortError') {
      console.error('Nominatim request timed out for:', address);
    } else {
      console.error('Error geocoding with Nominatim:', error);
    }
    return null;
  }
};

// Geocode using LocationIQ with timeout
const geocodeWithLocationIQ = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetchWithTimeout(
      `https://us1.locationiq.com/v1/search.php?key=demo&q=${encodedAddress}&format=json&limit=1&countrycodes=us`,
      REQUEST_TIMEOUT
    );
    
    if (!response.ok) {
      console.error('LocationIQ API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      geocodingCircuitBreaker.recordSuccess();
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    geocodingCircuitBreaker.recordFailure();
    if (error.name === 'AbortError') {
      console.error('LocationIQ request timed out for:', address);
    } else {
      console.error('Error geocoding with LocationIQ:', error);
    }
    return null;
  }
};

// Process addresses in controlled batches
const batchGeocodeFree = async (
  addresses: string[], 
  onProgress?: (completed: number, total: number) => void
): Promise<(GeocodingResult | null)[]> => {
  const results: (GeocodingResult | null)[] = new Array(addresses.length).fill(null);
  let consecutiveFailures = 0;
  let completed = 0;

  // Check circuit breaker before starting
  if (!geocodingCircuitBreaker.canProceed()) {
    console.warn('Geocoding circuit breaker is open, skipping batch geocoding');
    onProgress?.(addresses.length, addresses.length);
    return results;
  }

  // Process in batches to avoid overwhelming the APIs
  for (let i = 0; i < addresses.length; i += MAX_CONCURRENT) {
    if (consecutiveFailures >= MAX_FAILURES) {
      console.warn(`Stopping geocoding after ${MAX_FAILURES} consecutive failures`);
      break;
    }

    // Check circuit breaker before each batch
    if (!geocodingCircuitBreaker.canProceed()) {
      console.warn('Circuit breaker opened during batch processing, stopping');
      break;
    }

    const batch = addresses.slice(i, i + MAX_CONCURRENT);
    const batchPromises = batch.map(async (address, batchIndex) => {
      const actualIndex = i + batchIndex;
      console.log(`Geocoding ${actualIndex + 1}/${addresses.length}: ${address}`);
      
      // Try Nominatim first
      let result = await geocodeWithNominatim(address);
      
      // If Nominatim fails, try LocationIQ as fallback
      if (!result && geocodingCircuitBreaker.canProceed()) {
        console.log('Nominatim failed, trying LocationIQ...');
        result = await geocodeWithLocationIQ(address);
      }
      
      if (result) {
        console.log(`Successfully geocoded: ${address} → ${result.latitude}, ${result.longitude}`);
        consecutiveFailures = 0; // Reset failure counter on success
      } else {
        console.warn(`Failed to geocode: ${address}`);
        consecutiveFailures++;
      }
      
      return { index: actualIndex, result };
    });

    // Wait for the current batch to complete
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Process batch results
    batchResults.forEach((promiseResult) => {
      if (promiseResult.status === 'fulfilled') {
        const { index, result } = promiseResult.value;
        results[index] = result;
      }
      completed++;
      onProgress?.(completed, addresses.length);
    });

    // Add delay between batches (except for the last batch)
    if (i + MAX_CONCURRENT < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }
  
  return results;
};

// Main function to geocode locations with improved error handling
export const geocodeLocations = async (
  locations: Location[], 
  franchiseeId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<(GeocodingResult | null)[]> => {
  console.log(`Starting free geocoding for ${locations.length} locations`);
  
  try {
    // Load cached results
    const cachedResults = loadCachedResults(franchiseeId);
    const results: (GeocodingResult | null)[] = [];
    const uncachedLocations: { location: Location; index: number; address: string }[] = [];
    
    // Check which locations need geocoding
    locations.forEach((location, index) => {
      const addressKey = formatAddress(location);
      const cached = cachedResults.get(addressKey);
      
      if (cached !== undefined) {
        // Use cached result (could be null for failed geocoding)
        results[index] = cached;
        console.log(`Using cached result for: ${location.address}`);
      } else {
        // Needs geocoding
        results[index] = null; // placeholder
        uncachedLocations.push({ location, index, address: addressKey });
      }
    });
    
    // If all results are cached, return immediately
    if (uncachedLocations.length === 0) {
      console.log('All locations found in cache');
      onProgress?.(locations.length, locations.length);
      return results;
    }
    
    console.log(`Need to geocode ${uncachedLocations.length} new addresses`);
    
    // Geocode uncached locations with progress tracking
    const addresses = uncachedLocations.map(item => item.address);
    let batchCompleted = 0;
    
    const geocodedResults = await batchGeocodeFree(addresses, (batchProgress, batchTotal) => {
      const totalCompleted = locations.length - uncachedLocations.length + batchProgress;
      onProgress?.(totalCompleted, locations.length);
    });
    
    // Update results and cache
    uncachedLocations.forEach((item, geocodeIndex) => {
      const geocoded = geocodedResults[geocodeIndex];
      results[item.index] = geocoded;
      cachedResults.set(item.address, geocoded);
    });
    
    // Save updated cache
    saveCachedResults(franchiseeId, cachedResults);
    
    return results;
  } catch (error) {
    console.error('Error in geocodeLocations:', error);
    // Return empty results array instead of throwing
    return new Array(locations.length).fill(null);
  }
};

// Clear cache for a specific franchisee
export const clearGeocodingCache = (franchiseeId: string) => {
  const cacheKey = getCacheKey(franchiseeId);
  localStorage.removeItem(cacheKey);
  console.log(`Cleared geocoding cache for franchisee ${franchiseeId}`);
};

// Get cache statistics
export const getGeocodingCacheStats = (franchiseeId: string) => {
  const cached = loadCachedResults(franchiseeId);
  const successCount = Array.from(cached.values()).filter(result => result !== null).length;
  
  return {
    totalCached: cached.size,
    successfullyGeocoded: successCount,
    failedGeocoding: cached.size - successCount
  };
};
