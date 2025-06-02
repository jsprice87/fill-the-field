
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
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=us`;
    
    console.log(`Geocoding: ${address}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Mapbox API error for "${address}": ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Mapbox response for "${address}":`, data);
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      if (feature.center && feature.center.length >= 2) {
        const result = {
          lng: feature.center[0],
          lat: feature.center[1]
        };
        console.log(`Successfully geocoded "${address}" → ${result.lat}, ${result.lng}`);
        return result;
      }
    }
    
    console.warn(`No coordinates found for "${address}"`);
    return null;
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
  const results: GeocodingResult[] = [];
  
  console.log(`Starting batch geocoding for ${locations.length} locations`);
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    
    try {
      const coordinates = await geocodeSingleAddress(location.address, mapboxToken);
      
      results.push({
        id: location.id,
        coordinates: coordinates || undefined,
        error: coordinates ? undefined : 'Failed to geocode'
      });
      
      // Report progress
      if (onProgress) {
        onProgress(i + 1, locations.length);
      }
      
      // Rate limiting: wait between requests (except for the last one)
      if (i < locations.length - 1) {
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
  
  const successCount = results.filter(r => r.coordinates).length;
  console.log(`Batch geocoding completed: ${successCount}/${locations.length} locations successfully geocoded`);
  
  return results;
};
