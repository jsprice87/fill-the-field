
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

// Geocode using OpenStreetMap Nominatim
const geocodeWithNominatim = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`
    );
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding with Nominatim:', error);
    return null;
  }
};

// Geocode using LocationIQ (free tier: 5,000/day)
const geocodeWithLocationIQ = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    // Using LocationIQ's free tier without API key (limited requests)
    const response = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=demo&q=${encodedAddress}&format=json&limit=1&countrycodes=us`
    );
    
    if (!response.ok) {
      console.error('LocationIQ API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding with LocationIQ:', error);
    return null;
  }
};

// Batch geocode addresses using multiple free services
const batchGeocodeFree = async (addresses: string[]): Promise<(GeocodingResult | null)[]> => {
  const results: (GeocodingResult | null)[] = [];
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    console.log(`Geocoding ${i + 1}/${addresses.length}: ${address}`);
    
    // Try Nominatim first (most reliable free service)
    let result = await geocodeWithNominatim(address);
    
    // If Nominatim fails, try LocationIQ as fallback
    if (!result) {
      console.log('Nominatim failed, trying LocationIQ...');
      result = await geocodeWithLocationIQ(address);
    }
    
    results.push(result);
    
    if (result) {
      console.log(`Successfully geocoded: ${address} → ${result.latitude}, ${result.longitude}`);
    } else {
      console.warn(`Failed to geocode: ${address}`);
    }
    
    // Add delay between requests to be respectful to free APIs
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }
  
  return results;
};

// Main function to geocode locations with caching and multiple free services
export const geocodeLocations = async (
  locations: Location[], 
  franchiseeId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<(GeocodingResult | null)[]> => {
  console.log(`Starting free geocoding for ${locations.length} locations`);
  
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
  
  // Geocode uncached locations
  const addresses = uncachedLocations.map(item => item.address);
  const geocodedResults = await batchGeocodeFree(addresses);
  
  // Update results and cache as we get them
  uncachedLocations.forEach((item, geocodeIndex) => {
    const geocoded = geocodedResults[geocodeIndex];
    results[item.index] = geocoded;
    cachedResults.set(item.address, geocoded);
    
    // Report progress
    const completed = locations.length - uncachedLocations.length + geocodeIndex + 1;
    onProgress?.(completed, locations.length);
  });
  
  // Save updated cache
  saveCachedResults(franchiseeId, cachedResults);
  
  return results;
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
