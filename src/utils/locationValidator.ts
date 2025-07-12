import { geocodeAddress } from './geocoding';

interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ValidationResult {
  isValid: boolean;
  currentCoordinates?: { latitude: number; longitude: number };
  suggestedCoordinates?: { latitude: number; longitude: number };
  message: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Validates a location's coordinates against multiple geocoding sources
 * and suggests corrections if needed
 */
export const validateLocationCoordinates = async (
  location: Location,
  currentLat?: number,
  currentLng?: number
): Promise<ValidationResult> => {
  console.log('🔍 Validating location:', location);
  
  try {
    // Test multiple address formats for the specific location
    const addressVariations = [
      // Standard format
      {
        address: location.address,
        city: location.city,
        state: location.state,
        zip: location.zip
      },
      // With "United States" appended
      {
        address: `${location.address}, United States`,
        city: location.city,
        state: location.state,
        zip: location.zip
      }
    ];

    const geocodingResults = [];
    
    for (const variation of addressVariations) {
      const result = await geocodeAddress(variation);
      if (result) {
        geocodingResults.push(result);
        console.log('✅ Geocoding result for variation:', variation, '→', result);
      }
    }

    if (geocodingResults.length === 0) {
      return {
        isValid: false,
        message: 'Unable to geocode address with any format variation',
        confidence: 'low'
      };
    }

    // Find the most reliable result (first successful geocoding)
    const suggestedCoords = geocodingResults[0];
    
    // If no current coordinates provided, return the geocoded result
    if (!currentLat || !currentLng) {
      return {
        isValid: true,
        suggestedCoordinates: suggestedCoords,
        message: 'No current coordinates to validate, returning geocoded coordinates',
        confidence: 'high'
      };
    }

    // Calculate distance between current and suggested coordinates
    const distance = calculateDistance(
      currentLat, currentLng,
      suggestedCoords.latitude, suggestedCoords.longitude
    );

    console.log(`📏 Distance between current and geocoded: ${distance.toFixed(2)} miles`);

    // Define tolerance levels
    const closeDistance = 0.5; // 0.5 miles
    const moderateDistance = 2.0; // 2 miles

    if (distance <= closeDistance) {
      return {
        isValid: true,
        currentCoordinates: { latitude: currentLat, longitude: currentLng },
        suggestedCoordinates: suggestedCoords,
        message: `Coordinates are accurate (${distance.toFixed(2)} miles difference)`,
        confidence: 'high'
      };
    } else if (distance <= moderateDistance) {
      return {
        isValid: false,
        currentCoordinates: { latitude: currentLat, longitude: currentLng },
        suggestedCoordinates: suggestedCoords,
        message: `Coordinates may be inaccurate (${distance.toFixed(2)} miles difference). Consider updating.`,
        confidence: 'medium'
      };
    } else {
      return {
        isValid: false,
        currentCoordinates: { latitude: currentLat, longitude: currentLng },
        suggestedCoordinates: suggestedCoords,
        message: `Coordinates appear incorrect (${distance.toFixed(2)} miles difference). Update recommended.`,
        confidence: 'low'
      };
    }

  } catch (error) {
    console.error('❌ Error validating location coordinates:', error);
    return {
      isValid: false,
      message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence: 'low'
    };
  }
};

/**
 * Calculate distance between two coordinates in miles using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Specific validation for Lilley Gulch Soccer Fields
 */
export const validateLilleyGulchLocation = async (): Promise<ValidationResult> => {
  const lilleyGulchLocation: Location = {
    address: '6063 S Independence St',
    city: 'Littleton',
    state: 'CO',
    zip: '80123'
  };

  console.log('🏟️ Validating Lilley Gulch Soccer Fields location specifically...');
  
  // According to the investigation, current DB coordinates are: 39.5384674, -105.1058995
  const currentCoordinates = {
    latitude: 39.5384674,
    longitude: -105.1058995
  };

  return await validateLocationCoordinates(
    lilleyGulchLocation,
    currentCoordinates.latitude,
    currentCoordinates.longitude
  );
};