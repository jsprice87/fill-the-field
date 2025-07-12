/**
 * Utility for correcting and validating location coordinates
 * Specifically addresses issues like the Lilley Gulch positioning problem
 */

import { geocodeAddress } from './geocoding';

interface LocationData {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  currentLat?: number;
  currentLng?: number;
}

interface CorrectionResult {
  locationName: string;
  needsCorrection: boolean;
  currentCoordinates?: { lat: number; lng: number };
  suggestedCoordinates?: { lat: number; lng: number };
  distanceDifference?: number;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

/**
 * Known coordinate corrections for specific problematic locations
 * These are manually verified coordinates for locations with known issues
 */
const MANUAL_COORDINATE_CORRECTIONS: Record<string, { lat: number; lng: number; reason: string }> = {
  // Lilley Gulch Soccer Fields - manually verified coordinates
  'lilley gulch soccer fields': {
    lat: 39.5385,    // Verified coordinates for 6063 S Independence St, Littleton, CO 80123
    lng: -105.1059,  
    reason: 'Manual verification of 6063 S Independence St, Littleton, CO 80123'
  }
};

/**
 * Calculates distance between two coordinates in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Validates and suggests corrections for location coordinates
 */
export async function validateLocationCoordinates(location: LocationData): Promise<CorrectionResult> {
  const locationKey = location.name.toLowerCase();
  
  console.log(`🔍 Validating coordinates for: ${location.name}`);
  console.log(`   Address: ${location.address}, ${location.city}, ${location.state} ${location.zip}`);
  
  // Check for manual corrections first
  if (MANUAL_COORDINATE_CORRECTIONS[locationKey]) {
    const manualCorrection = MANUAL_COORDINATE_CORRECTIONS[locationKey];
    
    if (location.currentLat && location.currentLng) {
      const distance = calculateDistance(
        location.currentLat, location.currentLng,
        manualCorrection.lat, manualCorrection.lng
      );
      
      console.log(`   📏 Distance from manual correction: ${distance.toFixed(3)} miles`);
      
      if (distance > 0.1) { // More than ~500 feet difference
        return {
          locationName: location.name,
          needsCorrection: true,
          currentCoordinates: { lat: location.currentLat, lng: location.currentLng },
          suggestedCoordinates: { lat: manualCorrection.lat, lng: manualCorrection.lng },
          distanceDifference: distance,
          confidence: 'high',
          message: `Manual correction available. ${manualCorrection.reason}. Distance difference: ${distance.toFixed(3)} miles`
        };
      }
    }
    
    return {
      locationName: location.name,
      needsCorrection: false,
      currentCoordinates: location.currentLat && location.currentLng ? 
        { lat: location.currentLat, lng: location.currentLng } : undefined,
      confidence: 'high',
      message: 'Coordinates match manual verification'
    };
  }
  
  // Fallback to geocoding validation
  try {
    const geocodeResult = await geocodeAddress({
      address: location.address,
      city: location.city,
      state: location.state,
      zip: location.zip
    });
    
    if (!geocodeResult) {
      return {
        locationName: location.name,
        needsCorrection: false,
        confidence: 'low',
        message: 'Unable to geocode address for validation'
      };
    }
    
    if (!location.currentLat || !location.currentLng) {
      return {
        locationName: location.name,
        needsCorrection: true,
        suggestedCoordinates: { lat: geocodeResult.latitude, lng: geocodeResult.longitude },
        confidence: 'medium',
        message: 'No current coordinates - using geocoded result'
      };
    }
    
    const distance = calculateDistance(
      location.currentLat, location.currentLng,
      geocodeResult.latitude, geocodeResult.longitude
    );
    
    console.log(`   📏 Distance from geocoded result: ${distance.toFixed(3)} miles`);
    
    if (distance > 1.0) { // More than 1 mile difference
      return {
        locationName: location.name,
        needsCorrection: true,
        currentCoordinates: { lat: location.currentLat, lng: location.currentLng },
        suggestedCoordinates: { lat: geocodeResult.latitude, lng: geocodeResult.longitude },
        distanceDifference: distance,
        confidence: distance > 5 ? 'high' : 'medium',
        message: `Significant coordinate difference (${distance.toFixed(3)} miles). Consider updating.`
      };
    }
    
    return {
      locationName: location.name,
      needsCorrection: false,
      currentCoordinates: { lat: location.currentLat, lng: location.currentLng },
      confidence: 'high',
      message: `Coordinates are accurate (${distance.toFixed(3)} miles difference)`
    };
    
  } catch (error) {
    console.error('Error validating coordinates:', error);
    return {
      locationName: location.name,
      needsCorrection: false,
      confidence: 'low',
      message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generates SQL update statement for coordinate corrections
 */
export function generateCoordinateUpdateSQL(locationName: string, lat: number, lng: number): string {
  return `UPDATE locations SET latitude = ${lat.toFixed(7)}, longitude = ${lng.toFixed(7)} WHERE LOWER(name) LIKE '%${locationName.toLowerCase()}%';`;
}

/**
 * Quick test function for Lilley Gulch specifically
 */
export async function validateLilleyGulchCoordinates(): Promise<CorrectionResult> {
  const lilleyGulchData: LocationData = {
    name: 'Lilley Gulch Soccer Fields',
    address: '6063 S Independence St',
    city: 'Littleton',
    state: 'CO',
    zip: '80123',
    currentLat: 39.5384674,  // From investigation report
    currentLng: -105.1058995
  };
  
  return await validateLocationCoordinates(lilleyGulchData);
}