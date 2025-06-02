
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
  results: Map<string, MapboxGeocodingResult | null>;
  timestamp: number;
  franchiseeId: string;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = 'mapbox_geocoding_';

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

    // Convert array back to Map
    const resultsMap = new Map(Object.entries(parsedCache.results));
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

// Batch geocode addresses using Mapbox
const batchGeocodeWithMapbox = async (addresses: string[], mapboxToken: string): Promise<(MapboxGeocodingResult | null)[]> => {
  const BATCH_SIZE = 50; // Mapbox limit
  const results: (MapboxGeocodingResult | null)[] = [];
  
  // Process addresses in batches
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);
    console.log(`Geocoding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(addresses.length / BATCH_SIZE)} (${batch.length} addresses)`);
    
    try {
      // Create batch request URL
      const queries = batch.map(addr => encodeURIComponent(addr)).join(';');
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${queries}.json?access_token=${mapboxToken}&limit=1&country=us`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Mapbox API error: ${response.status} ${response.statusText}`);
        // Fill this batch with null results
        results.push(...Array(batch.length).fill(null));
        continue;
      }
      
      const data = await response.json();
      
      // Process each result in the batch
      batch.forEach((_, index) => {
        const feature = data.features?.[index];
        if (feature && feature.center) {
          results.push({
            longitude: feature.center[0],
            latitude: feature.center[1]
          });
        } else {
          results.push(null);
        }
      });
      
      // Add delay between batches to be respectful to API limits
      if (i + BATCH_SIZE < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error geocoding batch starting at index ${i}:`, error);
      // Fill this batch with null results
      results.push(...Array(batch.length).fill(null));
    }
  }
  
  return results;
};

// Main function to geocode locations with caching
export const geocodeLocationsWithMapbox = async (
  locations: Location[], 
  franchiseeId: string,
  mapboxToken?: string
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
  const geocodedResults = await batchGeocodeWithMapbox(addresses, mapboxToken);
  
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
