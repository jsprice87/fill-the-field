/**
 * Direct test script for Lilley Gulch geocoding validation
 * This can be run in the browser console or as a standalone test
 */

import { geocodeAddress } from './geocoding';

interface TestResult {
  address: string;
  coordinates?: { latitude: number; longitude: number };
  error?: string;
  distance?: number;
}

const CURRENT_DB_COORDINATES = {
  latitude: 39.5384674,
  longitude: -105.1058995
};

// Calculate distance between two coordinates in miles
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

export async function testLilleyGulchGeocoding(): Promise<void> {
  console.log('🔍 Testing Lilley Gulch Soccer Fields geocoding...');
  console.log('Current DB coordinates:', CURRENT_DB_COORDINATES);
  
  const testAddresses = [
    {
      description: 'Exact address (ZIP 80123)',
      address: '6063 S Independence St',
      city: 'Littleton',
      state: 'CO',
      zip: '80123'
    },
    {
      description: 'Alternate ZIP (80127)',
      address: '6063 S Independence St',
      city: 'Littleton',
      state: 'CO',
      zip: '80127'
    },
    {
      description: 'With area specifier',
      address: '6063 S Independence St, Kipling Hills',
      city: 'Littleton',
      state: 'CO',
      zip: '80123'
    },
    {
      description: 'Facility name only',
      address: 'Lilley Gulch Soccer Fields',
      city: 'Littleton',
      state: 'CO',
      zip: '80123'
    }
  ];

  const results: TestResult[] = [];

  for (const testAddr of testAddresses) {
    console.log(`\n📍 Testing: ${testAddr.description}`);
    console.log(`   Address: ${testAddr.address}, ${testAddr.city}, ${testAddr.state} ${testAddr.zip}`);
    
    try {
      const result = await geocodeAddress(testAddr);
      
      if (result) {
        const distance = calculateDistance(
          CURRENT_DB_COORDINATES.latitude,
          CURRENT_DB_COORDINATES.longitude,
          result.latitude,
          result.longitude
        );
        
        results.push({
          address: `${testAddr.address}, ${testAddr.city}, ${testAddr.state} ${testAddr.zip}`,
          coordinates: result,
          distance: distance
        });
        
        console.log(`   ✅ Result: ${result.latitude.toFixed(7)}, ${result.longitude.toFixed(7)}`);
        console.log(`   📏 Distance from current: ${distance.toFixed(2)} miles`);
        
        if (distance > 2) {
          console.log(`   ⚠️  WARNING: Significant distance difference (${distance.toFixed(2)} miles)`);
        } else if (distance > 0.5) {
          console.log(`   ⚠️  MODERATE: Notable distance difference (${distance.toFixed(2)} miles)`);
        } else {
          console.log(`   ✅ GOOD: Close match (${distance.toFixed(2)} miles)`);
        }
      } else {
        console.log('   ❌ No geocoding result');
        results.push({
          address: `${testAddr.address}, ${testAddr.city}, ${testAddr.state} ${testAddr.zip}`,
          error: 'No geocoding result'
        });
      }
    } catch (error) {
      console.log('   ❌ Error:', error);
      results.push({
        address: `${testAddr.address}, ${testAddr.city}, ${testAddr.state} ${testAddr.zip}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 SUMMARY RESULTS:');
  console.log('==================');
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.address}`);
    if (result.coordinates) {
      console.log(`   Coordinates: ${result.coordinates.latitude.toFixed(7)}, ${result.coordinates.longitude.toFixed(7)}`);
      if (result.distance !== undefined) {
        console.log(`   Distance: ${result.distance.toFixed(2)} miles`);
        if (result.distance < 0.5) {
          console.log('   Status: ✅ ACCURATE');
        } else if (result.distance < 2) {
          console.log('   Status: ⚠️ MODERATE DIFFERENCE');
        } else {
          console.log('   Status: ❌ SIGNIFICANT DIFFERENCE');
        }
      }
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Find the best result
  const validResults = results.filter(r => r.coordinates && r.distance !== undefined);
  if (validResults.length > 0) {
    const bestResult = validResults.reduce((best, current) => 
      (current.distance! < best.distance!) ? current : best
    );
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('=================');
    console.log(`Best geocoding result: ${bestResult.address}`);
    console.log(`Coordinates: ${bestResult.coordinates!.latitude.toFixed(7)}, ${bestResult.coordinates!.longitude.toFixed(7)}`);
    console.log(`Distance from current: ${bestResult.distance!.toFixed(2)} miles`);
    
    if (bestResult.distance! > 0.5) {
      console.log('🔧 RECOMMENDED ACTION: Update database coordinates');
      console.log('   Suggested SQL:');
      console.log(`   UPDATE locations SET latitude = ${bestResult.coordinates!.latitude.toFixed(7)}, longitude = ${bestResult.coordinates!.longitude.toFixed(7)} WHERE name = 'Lilley Gulch Soccer Fields';`);
    } else {
      console.log('✅ CURRENT COORDINATES: Appear to be accurate');
    }
  }

  console.log('\n🔗 Verification Links:');
  console.log('======================');
  console.log(`Current location: https://www.google.com/maps/@${CURRENT_DB_COORDINATES.latitude},${CURRENT_DB_COORDINATES.longitude},15z`);
  if (validResults.length > 0) {
    const best = validResults[0];
    console.log(`Geocoded location: https://www.google.com/maps/@${best.coordinates!.latitude},${best.coordinates!.longitude},15z`);
  }
}

// Export for use in console or components
(window as any).testLilleyGulch = testLilleyGulchGeocoding;