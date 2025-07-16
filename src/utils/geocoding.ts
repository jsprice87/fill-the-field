
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

/**
 * Try Google Geocoding API first (most accurate), fallback to OpenStreetMap
 */
const tryGoogleGeocoding = async (location: Location): Promise<GeocodingResult | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.log('🔄 Google API key not found, skipping Google geocoding');
    return null;
  }

  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  
  try {
    console.log('🌐 Trying Google Geocoding API for:', fullAddress);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.warn('Google API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const coordinates = {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng
      };
      
      console.log('✅ Google geocoding successful:', coordinates);
      console.log('📍 Google result:', result.formatted_address);
      
      return coordinates;
    } else {
      console.warn('Google API returned no results:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Google geocoding error:', error);
    return null;
  }
};

/**
 * Try OpenStreetMap Nominatim API (fallback)
 */
const tryOpenStreetMapGeocoding = async (location: Location): Promise<GeocodingResult | null> => {
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  
  console.log('🗺️ Trying OpenStreetMap geocoding for:', fullAddress);
    
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
      console.warn(`OpenStreetMap API error for "${addressFormat}":`, response.status, response.statusText);
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
        
        console.log('🔍 Validating OpenStreetMap result:');
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
        
        console.log('✅ OpenStreetMap geocoding successful:', addressFormat);
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
  
  console.warn('No valid OpenStreetMap results found for:', fullAddress);
  return null;
};

// Known coordinate corrections for specific problematic locations
// These are manually verified coordinates for locations with known issues
const MANUAL_COORDINATE_CORRECTIONS: Record<string, { lat: number; lng: number; reason: string }> = {
  // Lilley Gulch Soccer Fields - manually verified coordinates
  'lilley gulch soccer fields': {
    lat: 39.5385,    // Verified coordinates for 6063 S Independence St, Littleton, CO 80123
    lng: -105.1059,  
    reason: 'Manual verification of 6063 S Independence St, Littleton, CO 80123'
  }
};

/**
 * Add or update a manual coordinate correction
 * Useful for fixing specific location positioning issues
 */
export const addManualCoordinateCorrection = (
  locationName: string, 
  lat: number, 
  lng: number, 
  reason: string
) => {
  const key = locationName.toLowerCase().trim();
  MANUAL_COORDINATE_CORRECTIONS[key] = { lat, lng, reason };
  console.log(`Added manual coordinate correction for "${locationName}":`, { lat, lng, reason });
};

export const geocodeAddress = async (location: Location, forceRefresh = false): Promise<GeocodingResult | null> => {
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  const cacheKey = fullAddress.toLowerCase().trim();
  
  // Check for manual coordinate corrections first
  const locationKey = location.name?.toLowerCase().trim();
  if (locationKey && MANUAL_COORDINATE_CORRECTIONS[locationKey]) {
    const correction = MANUAL_COORDINATE_CORRECTIONS[locationKey];
    console.log(`🔧 Using manual coordinate correction for "${location.name}":`, correction);
    const correctedCoordinates = {
      latitude: correction.lat,
      longitude: correction.lng
    };
    // Cache the manual correction
    geocodeCache.set(cacheKey, correctedCoordinates);
    return correctedCoordinates;
  }
  
  // Check cache first (unless forcing fresh lookup)
  if (!forceRefresh && geocodeCache.has(cacheKey)) {
    console.log('Using cached coordinates for:', fullAddress);
    return geocodeCache.get(cacheKey)!;
  }
  
  try {
    console.log(`🗺️ Geocoding address${forceRefresh ? ' (force refresh)' : ''}:`, fullAddress);
    
    // Try Google Geocoding API first (most accurate)
    let coordinates = await tryGoogleGeocoding(location);
    
    // Fallback to OpenStreetMap if Google fails
    if (!coordinates) {
      console.log('🔄 Google geocoding failed, trying OpenStreetMap...');
      coordinates = await tryOpenStreetMapGeocoding(location);
    }
    
    if (coordinates) {
      // Cache the successful result
      geocodeCache.set(cacheKey, coordinates);
      return coordinates;
    }
    
    console.warn('❌ All geocoding methods failed for:', fullAddress);
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
