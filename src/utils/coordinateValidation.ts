
export interface ValidatedCoordinates {
  latitude: number;
  longitude: number;
  isValid: boolean;
}

export const validateCoordinates = (lat: any, lng: any): ValidatedCoordinates => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  
  // Check if conversion to number was successful
  if (isNaN(latitude) || isNaN(longitude)) {
    console.warn('Invalid coordinates: NaN values', { lat, lng });
    return { latitude: 0, longitude: 0, isValid: false };
  }
  
  // Check latitude bounds (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    console.warn('Invalid latitude: out of bounds', { latitude });
    return { latitude: 0, longitude: 0, isValid: false };
  }
  
  // Check longitude bounds (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    console.warn('Invalid longitude: out of bounds', { longitude });
    return { latitude: 0, longitude: 0, isValid: false };
  }
  
  // Check for exactly zero coordinates (likely missing data)
  if (latitude === 0 && longitude === 0) {
    console.warn('Suspicious coordinates: exactly 0,0', { latitude, longitude });
    return { latitude, longitude, isValid: false };
  }
  
  return { latitude, longitude, isValid: true };
};

export const validateLocationArray = (locations: any[]): { valid: any[], invalid: any[] } => {
  const valid: any[] = [];
  const invalid: any[] = [];
  
  locations.forEach((location, index) => {
    const coords = validateCoordinates(location.latitude, location.longitude);
    
    if (coords.isValid) {
      valid.push({
        ...location,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
    } else {
      console.warn(`Location ${index} has invalid coordinates:`, location);
      invalid.push(location);
    }
  });
  
  return { valid, invalid };
};
