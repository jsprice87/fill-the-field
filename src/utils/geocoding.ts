
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

// Cache for geocoded coordinates to avoid repeated API calls
const geocodeCache = new Map<string, GeocodingResult>();

export const geocodeAddress = async (location: Location): Promise<GeocodingResult | null> => {
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  const cacheKey = fullAddress.toLowerCase().trim();
  
  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    console.log('Using cached coordinates for:', fullAddress);
    return geocodeCache.get(cacheKey)!;
  }
  
  try {
    console.log('Geocoding address:', fullAddress);
    
    // Use OpenStreetMap Nominatim API (free, no API key required)
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`
    );
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result: GeocodingResult = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
      
      // Cache the result
      geocodeCache.set(cacheKey, result);
      console.log('Geocoded successfully:', fullAddress, '→', result);
      
      return result;
    } else {
      console.warn('No geocoding results found for:', fullAddress);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', fullAddress, error);
    return null;
  }
};

export const geocodeMultipleAddresses = async (locations: Location[]): Promise<(GeocodingResult | null)[]> => {
  // Process addresses with a small delay to be respectful to the free API
  const results: (GeocodingResult | null)[] = [];
  
  for (let i = 0; i < locations.length; i++) {
    const result = await geocodeAddress(locations[i]);
    results.push(result);
    
    // Add a small delay between requests to be respectful to the API
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};
