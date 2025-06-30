/**
 * Geocoding Debug Utility
 * Helps diagnose location positioning issues by testing multiple geocoding services
 */

interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  source: string;
  query: string;
  confidence?: number;
  display_name?: string;
}

export const debugGeocoding = async (location: Location): Promise<GeocodingResult[]> => {
  const results: GeocodingResult[] = [];
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  
  console.log('🔍 Debug geocoding for:', fullAddress);
  
  // Test 1: OpenStreetMap Nominatim (current client-side method)
  try {
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us&addressdetails=1`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        results.push({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          source: 'OpenStreetMap Nominatim',
          query: fullAddress,
          confidence: parseFloat(data[0].importance || '0'),
          display_name: data[0].display_name
        });
        console.log('✅ OpenStreetMap result:', data[0]);
      } else {
        console.log('❌ OpenStreetMap: No results found');
      }
    }
  } catch (error) {
    console.error('❌ OpenStreetMap error:', error);
  }
  
  // Test 2: Alternative address formats
  const alternativeFormats = [
    `${location.address}, ${location.city}, ${location.state}, ${location.zip}`,
    `${location.address}, ${location.city}, ${location.state} ${location.zip}, USA`,
    `${location.address} ${location.city} ${location.state} ${location.zip}`,
  ];
  
  for (const altAddress of alternativeFormats) {
    try {
      const encodedAddress = encodeURIComponent(altAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          results.push({
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            source: `OpenStreetMap (Alt: ${altAddress})`,
            query: altAddress,
            confidence: parseFloat(data[0].importance || '0'),
            display_name: data[0].display_name
          });
        }
      }
    } catch (error) {
      console.error(`❌ Alternative format error (${altAddress}):`, error);
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
};

export const validateCoordinates = (latitude: number, longitude: number, expectedState: string = 'CO'): {
  valid: boolean;
  issues: string[];
  location: string;
} => {
  const issues: string[] = [];
  
  // Check if coordinates are valid numbers
  if (isNaN(latitude) || isNaN(longitude)) {
    issues.push('Coordinates contain NaN values');
  }
  
  if (!isFinite(latitude) || !isFinite(longitude)) {
    issues.push('Coordinates contain infinite values');
  }
  
  // Check if coordinates are within continental US bounds
  if (latitude < 24 || latitude > 49) {
    issues.push(`Latitude ${latitude} is outside continental US bounds (24-49)`);
  }
  
  if (longitude < -125 || longitude > -66) {
    issues.push(`Longitude ${longitude} is outside continental US bounds (-125 to -66)`);
  }
  
  // Colorado-specific bounds if state is CO
  if (expectedState === 'CO') {
    if (latitude < 36.99 || latitude > 41.003) {
      issues.push(`Latitude ${latitude} is outside Colorado bounds (36.99-41.003)`);
    }
    
    if (longitude < -109.06 || longitude > -102.04) {
      issues.push(`Longitude ${longitude} is outside Colorado bounds (-109.06 to -102.04)`);
    }
  }
  
  // Determine rough location for sanity check
  let location = 'Unknown';
  if (latitude >= 39.5 && latitude <= 40.0 && longitude >= -105.5 && longitude <= -104.5) {
    location = 'Denver Metro Area';
  } else if (latitude >= 36.99 && latitude <= 41.003 && longitude >= -109.06 && longitude <= -102.04) {
    location = 'Colorado (outside Denver metro)';
  } else if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
    location = 'Continental US (outside Colorado)';
  }
  
  return {
    valid: issues.length === 0,
    issues,
    location
  };
};

export const diagnoseLocationIssue = async (location: Location): Promise<void> => {
  console.log('\n🚨 LOCATION DIAGNOSTIC REPORT 🚨');
  console.log('=====================================');
  console.log('Location:', location);
  
  // Test geocoding
  const results = await debugGeocoding(location);
  
  console.log('\n📍 Geocoding Results:');
  console.log('----------------------');
  
  if (results.length === 0) {
    console.log('❌ No geocoding results found from any service');
    console.log('💡 Suggestions:');
    console.log('   - Check spelling of address, city, state');
    console.log('   - Verify ZIP code is correct');
    console.log('   - Try removing apartment/unit numbers');
    console.log('   - Check if location actually exists');
    return;
  }
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.source}:`);
    console.log(`   Query: "${result.query}"`);
    console.log(`   Coordinates: ${result.latitude}, ${result.longitude}`);
    if (result.display_name) {
      console.log(`   Display Name: ${result.display_name}`);
    }
    if (result.confidence) {
      console.log(`   Confidence: ${result.confidence}`);
    }
    
    const validation = validateCoordinates(result.latitude, result.longitude, location.state);
    console.log(`   Location Check: ${validation.location}`);
    
    if (!validation.valid) {
      console.log(`   ⚠️ Issues: ${validation.issues.join(', ')}`);
    } else {
      console.log(`   ✅ Coordinates appear valid`);
    }
  });
  
  // Check for coordinate discrepancies
  if (results.length > 1) {
    const latitudes = results.map(r => r.latitude);
    const longitudes = results.map(r => r.longitude);
    
    const latRange = Math.max(...latitudes) - Math.min(...latitudes);
    const lngRange = Math.max(...longitudes) - Math.min(...longitudes);
    
    console.log('\n🔄 Coordinate Consistency:');
    console.log('---------------------------');
    console.log(`Latitude range: ${latRange.toFixed(6)} degrees`);
    console.log(`Longitude range: ${lngRange.toFixed(6)} degrees`);
    
    if (latRange > 0.01 || lngRange > 0.01) {
      console.log('⚠️ WARNING: Significant coordinate discrepancy detected!');
      console.log('💡 Different geocoding services are returning different locations.');
    } else {
      console.log('✅ Coordinates are consistent across services');
    }
  }
  
  console.log('\n=====================================\n');
};