
import { supabase } from '@/integrations/supabase/client';

interface LocationRecord {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

export const backfillLocationCoordinates = async (franchiseeId: string): Promise<void> => {
  console.log(`Starting coordinate backfill for franchisee: ${franchiseeId}`);

  try {
    // Get all locations without coordinates
    const { data: locations, error: fetchError } = await supabase
      .from('locations')
      .select('id, address, city, state, zip, latitude, longitude')
      .eq('franchisee_id', franchiseeId)
      .or('latitude.is.null,longitude.is.null');

    if (fetchError) {
      console.error('Error fetching locations:', fetchError);
      throw fetchError;
    }

    if (!locations || locations.length === 0) {
      console.log('No locations need coordinate backfill');
      return;
    }

    console.log(`Found ${locations.length} locations needing coordinates`);

    let successCount = 0;
    let failureCount = 0;

    // Process each location with rate limiting
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
      
      try {
        console.log(`Geocoding location ${i + 1}/${locations.length}: ${location.address}`);

        // Call the geocoding edge function
        const { data, error } = await supabase.functions.invoke('geocode-address', {
          body: { address: fullAddress }
        });

        if (error) {
          console.error(`Geocoding failed for location ${location.id}:`, error);
          failureCount++;
          continue;
        }

        if (data && data.latitude && data.longitude) {
          // Update the location with coordinates
          const { error: updateError } = await supabase
            .from('locations')
            .update({
              latitude: data.latitude,
              longitude: data.longitude
            })
            .eq('id', location.id);

          if (updateError) {
            console.error(`Failed to update coordinates for location ${location.id}:`, updateError);
            failureCount++;
          } else {
            console.log(`Successfully updated coordinates for: ${location.address}`);
            successCount++;
          }
        } else {
          console.warn(`No coordinates returned for: ${location.address}`);
          failureCount++;
        }

        // Rate limiting: wait 1 second between requests
        if (i < locations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error processing location ${location.id}:`, error);
        failureCount++;
      }
    }

    console.log(`Backfill completed: ${successCount} successful, ${failureCount} failed`);

  } catch (error) {
    console.error('Error during coordinate backfill:', error);
    throw error;
  }
};
