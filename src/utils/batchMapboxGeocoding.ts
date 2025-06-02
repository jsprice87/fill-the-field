
interface Location {
  id: string;
  address: string;
}

interface GeocodingResult {
  id: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  error?: string;
}

const RATE_LIMIT_DELAY = 200; // milliseconds between requests

const geocodeSingleAddress = async (address: string, mapboxToken: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    if (!address || typeof address !== 'string' || !address.trim()) {
      console.warn('Invalid address provided for geocoding:', address);
      return null;
    }

    if (!mapboxToken || typeof mapboxToken !== 'string' || !mapboxToken.trim()) {
      console.error('Invalid Mapbox token provided');
      return null;
    }

    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=us`;
    
    console.log(`Geocoding: ${address}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Mapbox API error for "${address}": ${response.status} ${response.statusText}`);
      
      // Handle specific error codes
      if (response.status === 401) {
        console.error('Mapbox API key is invalid or expired');
      } else if (response.status === 429) {
        console.error('Mapbox API rate limit exceeded');
      }
      
      return null;
    }
    
    const data = await response.json();
    console.log(`Mapbox response for "${address}":`, data);
    
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
      const feature = data.features[0];
      if (feature.center && Array.isArray(feature.center) && feature.center.length >= 2) {
        const lng = parseFloat(feature.center[0]);
        const lat = parseFloat(feature.center[1]);
        
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
          console.warn(`Invalid coordinates returned for "${address}": lat=${lat}, lng=${lng}`);
          return null;
        }
        
        // Basic bounds check for US coordinates
        if (lat < 24 || lat > 71 || lng < -180 || lng > -66) {
          console.warn(`Coordinates outside expected US bounds for "${address}": lat=${lat}, lng=${lng}`);
        }
        
        const result = { lng, lat };
        console.log(`Successfully geocoded "${address}" → ${result.lat}, ${result.lng}`);
        return result;
      } else {
        console.warn(`No valid center coordinates found for "${address}"`);
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

export const batchGeocodeWithMapbox = async (
  locations: Location[],
  mapboxToken: string,
  onProgress?: (current: number, total: number) => void
): Promise<GeocodingResult[]> => {
  console.log(`Starting batch geocoding for ${locations.length} locations`);
  
  // Validate inputs
  if (!Array.isArray(locations) || locations.length === 0) {
    console.warn('No valid locations provided for geocoding');
    return [];
  }
  
  if (!mapboxToken || typeof mapboxToken !== 'string' || !mapboxToken.trim()) {
    console.error('Invalid Mapbox token provided for batch geocoding');
    return locations.map(location => ({
      id: location.id,
      error: 'Invalid Mapbox token'
    }));
  }
  
  // Filter out invalid locations
  const validLocations = locations.filter(location => 
    location && 
    typeof location.id === 'string' && 
    typeof location.address === 'string' && 
    location.address.trim()
  );
  
  if (validLocations.length !== locations.length) {
    console.warn(`Filtered out ${locations.length - validLocations.length} invalid locations`);
  }
  
  const results: GeocodingResult[] = [];
  
  for (let i = 0; i < validLocations.length; i++) {
    const location = validLocations[i];
    
    try {
      const coordinates = await geocodeSingleAddress(location.address, mapboxToken);
      
      results.push({
        id: location.id,
        coordinates: coordinates || undefined,
        error: coordinates ? undefined : 'Failed to geocode'
      });
      
      // Report progress
      if (onProgress) {
        try {
          onProgress(i + 1, validLocations.length);
        } catch (progressError) {
          console.warn('Error reporting progress:', progressError);
        }
      }
      
      // Rate limiting: wait between requests (except for the last one)
      if (i < validLocations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Failed to geocode location "${location.address}":`, error);
      results.push({
        id: location.id,
        error: 'Geocoding failed'
      });
    }
  }
  
  // Add results for any invalid locations that were filtered out
  const invalidLocations = locations.filter(location => !validLocations.includes(location));
  invalidLocations.forEach(location => {
    results.push({
      id: location.id || 'unknown',
      error: 'Invalid location data'
    });
  });
  
  const successCount = results.filter(r => r.coordinates).length;
  console.log(`Batch geocoding completed: ${successCount}/${locations.length} locations successfully geocoded`);
  
  return results;
};
