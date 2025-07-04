
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
    
    // Try multiple address formats for better geocoding success
    const addressFormats = [
      `${location.address}, ${location.city}, ${location.state} ${location.zip}`, // Current format
      `${location.address}, ${location.city}, ${location.state}, ${location.zip}`, // Comma-separated
      `${location.address}, ${location.city}, ${location.state} ${location.zip}, USA`, // With country
    ];
    
    for (const addressFormat of addressFormats) {
      const encodedAddress = encodeURIComponent(addressFormat);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us&addressdetails=1`
      );
      
      if (!response.ok) {
        console.warn(`Geocoding API error for "${addressFormat}":`, response.status, response.statusText);
        continue; // Try next format
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Validate coordinates are reasonable for US locations
        if (isValidUSCoordinates(lat, lon)) {
          const result: GeocodingResult = {
            latitude: lat,
            longitude: lon
          };
          
          // Cache the result using original format as key
          geocodeCache.set(cacheKey, result);
          console.log('Geocoded successfully:', addressFormat, '→', result);
          console.log('Location details:', data[0].display_name);
          
          return result;
        } else {
          console.warn(`Invalid coordinates for "${addressFormat}":`, lat, lon, '- outside US bounds');
          continue; // Try next format
        }
      }
      
      // Add small delay between API calls to be respectful
      if (addressFormats.indexOf(addressFormat) < addressFormats.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.warn('No valid geocoding results found for any format of:', fullAddress);
    return null;
    
  } catch (error) {
    console.error('Error geocoding address:', fullAddress, error);
    return null;
  }
};

// Validate coordinates are within reasonable US bounds
const isValidUSCoordinates = (latitude: number, longitude: number): boolean => {
  // Check for invalid values
  if (isNaN(latitude) || isNaN(longitude) || !isFinite(latitude) || !isFinite(longitude)) {
    return false;
  }
  
  // Continental US bounds (extended slightly for territories)
  const validLatitude = latitude >= 18.0 && latitude <= 72.0; // Includes Alaska, Hawaii, and territories
  const validLongitude = longitude >= -180.0 && longitude <= -66.0; // Continental US + territories
  
  if (!validLatitude || !validLongitude) {
    console.warn(`Coordinates outside expected US bounds: lat=${latitude} (18-72), lon=${longitude} (-180 to -66)`);
    return false;
  }
  
  return true;
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
