
interface MapboxGeocodingResult {
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
  results: Record<string, MapboxGeocodingResult | null>;
  timestamp: number;
  franchiseeId: string;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = 'mapbox_geocoding_';

// Rate limiting: 600 requests per minute for most Mapbox plans (10 per second)
const RATE_LIMIT_DELAY = 150; // milliseconds between requests

// Get cache key for a franchisee
const getCacheKey = (franchiseeId: string) => `${CACHE_KEY_PREFIX}${franchiseeId}`;

// Create address string for geocoding
const formatAddress = (location: Location): string => {
  return `${location.address}, ${location.city}, ${location.state} ${location.zip}, USA`;
};

// Load cached geocoding results
const loadCachedResults = (franchiseeId: string): Map<string, MapboxGeocodingResult | null> => {
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
    const resultsMap = new Map<string, MapboxGeocodingResult | null>();
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
const saveCachedResults = (franchiseeId: string, results: Map<string, MapboxGeocodingResult | null>) => {
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

// Geocode a single address using Mapbox
const geocodeSingleAddress = async (address: string, mapboxToken: string): Promise<MapboxGeocodingResult | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=us`;
    
    console.log(`Geocoding: ${address}`);
    console.log(`API URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Mapbox API error for "${address}": ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log(`Mapbox response for "${address}":`, data);
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      if (feature.center && feature.center.length >= 2) {
        const result = {
          longitude: feature.center[0],
          latitude: feature.center[1]
        };
        console.log(`Successfully geocoded "${address}" → ${result.latitude}, ${result.longitude}`);
        return result;
      } else {
        console.warn(`No valid coordinates found for "${address}"`);
        return null;
      }
    } else {
      console.warn(`No features found for "${address}"`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding "${address}":`, error);
    return null;
  }
};

// Geocode addresses individually with rate limiting
const geocodeWithMapbox = async (
  addresses: string[], 
  mapboxToken: string,
  onProgress?: (completed: number, total: number) => void
): Promise<(MapboxGeocodingResult | null)[]> => {
  const results: (MapboxGeocodingResult | null)[] = [];
  
  console.log(`Starting individual geocoding for ${addresses.length} addresses with rate limiting`);
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    
    try {
      const result = await geocodeSingleAddress(address, mapboxToken);
      results.push(result);
      
      // Report progress
      if (onProgress) {
        onProgress(i + 1, addresses.length);
      }
      
      // Rate limiting: wait between requests (except for the last one)
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Failed to geocode address "${address}":`, error);
      results.push(null);
    }
  }
  
  const successCount = results.filter(r => r !== null).length;
  console.log(`Geocoding completed: ${successCount}/${addresses.length} addresses successfully geocoded`);
  
  return results;
};

// Main function to geocode locations with caching
export const geocodeLocationsWithMapbox = async (
  locations: Location[], 
  franchiseeId: string,
  mapboxToken?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<(MapboxGeocodingResult | null)[]> => {
  console.log(`Starting geocoding for ${locations.length} locations`);
  
  // Load cached results
  const cachedResults = loadCachedResults(franchiseeId);
  const results: (MapboxGeocodingResult | null)[] = [];
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
    return results;
  }
  
  // Check if we have a Mapbox token
  if (!mapboxToken) {
    console.warn('No Mapbox token provided, cannot geocode new addresses');
    return results;
  }
  
  console.log(`Need to geocode ${uncachedLocations.length} new addresses`);
  
  // Geocode uncached locations
  const addresses = uncachedLocations.map(item => item.address);
  const geocodedResults = await geocodeWithMapbox(addresses, mapboxToken, onProgress);
  
  // Update results and cache
  uncachedLocations.forEach((item, geocodeIndex) => {
    const geocoded = geocodedResults[geocodeIndex];
    results[item.index] = geocoded;
    cachedResults.set(item.address, geocoded);
    
    if (geocoded) {
      console.log(`Successfully geocoded: ${item.location.address} → ${geocoded.latitude}, ${geocoded.longitude}`);
    } else {
      console.warn(`Failed to geocode: ${item.location.address}`);
    }
  });
  
  // Save updated cache
  saveCachedResults(franchiseeId, cachedResults);
  
  return results;
};

// Clear cache for a specific franchisee (useful for testing)
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
