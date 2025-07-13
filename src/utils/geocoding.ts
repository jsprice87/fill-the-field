
interface GeocodingResult {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
  name?: string; // Optional location name for debugging
}

// Cache for geocoded coordinates to avoid repeated API calls
const geocodeCache = new Map<string, GeocodingResult>();

/**
 * Clear geocoding cache - useful for forcing fresh coordinate lookups
 */
export const clearGeocodeCache = () => {
  geocodeCache.clear();
  console.log('Geocoding cache cleared');
};

export const geocodeAddress = async (location: Location, forceRefresh = false): Promise<GeocodingResult | null> => {
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  const cacheKey = fullAddress.toLowerCase().trim();
  
  // Check cache first (unless forcing fresh lookup)
  if (!forceRefresh && geocodeCache.has(cacheKey)) {
    console.log('Using cached coordinates for:', fullAddress);
    return geocodeCache.get(cacheKey)!;
  }
  
  try {
    console.log(`🗺️ Geocoding address${forceRefresh ? ' (force refresh)' : ''}:`, fullAddress);
    
    // Try multiple address formats for better geocoding success
    const addressFormats = [
      `${location.address}, ${location.city}, ${location.state} ${location.zip}`, // Current format
      `${location.address}, ${location.city}, ${location.state}, ${location.zip}`, // Comma-separated
      `${location.address}, ${location.city}, ${location.state} ${location.zip}, USA`, // With country
      `${location.address}, ${location.zip}, USA`, // ZIP + country for precision
      `${location.address} ${location.city} ${location.state} ${location.zip}`, // Space-separated
      `${location.name}, ${location.address}, ${location.city}, ${location.state} ${location.zip}`, // With location name
      `${location.address}, ${location.zip}`, // Simplified format
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
          
          // Additional validation: Check if the returned location makes sense
          const displayName = data[0].display_name || '';
          const addressDetails = data[0].address || {};
          
          console.log('🔍 Validating geocoding result:');
          console.log('📍 Display name:', displayName);
          console.log('🏠 Address details:', addressDetails);
          console.log('🎯 Coordinates:', result);
          
          // Check if the result seems to match our input (basic validation)
          const inputZip = location.zip;
          const resultZip = addressDetails.postcode;
          
          if (resultZip && inputZip && resultZip !== inputZip) {
            console.warn(`⚠️ ZIP code mismatch: input=${inputZip}, result=${resultZip}. Trying next format.`);
            continue; // Try next address format
          }
          
          // Cache the result using original format as key
          geocodeCache.set(cacheKey, result);
          console.log('✅ Geocoded successfully:', addressFormat);
          console.log('🎯 Final coordinates:', result);
          
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
