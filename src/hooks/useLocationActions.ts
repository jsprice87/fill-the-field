
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notify';
import type { LocationFormData } from '@/components/locations/LocationForm';
import { geocodeAddress } from '@/utils/geocoding';
import { useFranchiseeProfile } from '@/hooks/useFranchiseeProfile';

export const useArchiveLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      notify('success', 'Location archived successfully');
    },
    onError: (error) => {
      console.error('Error archiving location:', error);
      notify('error', 'Failed to archive location');
    }
  });
};

export const useUnarchiveLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: true })
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      notify('success', 'Location unarchived successfully');
    },
    onError: (error) => {
      console.error('Error unarchiving location:', error);
      notify('error', 'Failed to unarchive location');
    }
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      notify('success', 'Location deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
      notify('error', 'Failed to delete location');
    }
  });
};

export const useToggleLocationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ locationId, isActive }: { locationId: string; isActive: boolean }) => {
      // First, get the current location data
      const { data: location, error: fetchError } = await supabase
        .from('locations')
        .select('name, address, city, state, zip')
        .eq('id', locationId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Recalculate coordinates with fresh geocoding
      let updateData: any = { is_active: isActive };
      
      if (location) {
        try {
          const coordinates = await geocodeAddress({
            address: location.address,
            city: location.city,
            state: location.state,
            zip: location.zip,
            name: location.name || location.address // Fallback to address if name is null
          }, true); // Force fresh lookup
          
          if (coordinates) {
            updateData.latitude = coordinates.latitude;
            updateData.longitude = coordinates.longitude;
          }
        } catch (geocodeError) {
          console.warn('Geocoding failed during toggle, updating status only:', geocodeError);
        }
      }
      
      // Update the location with new status and potentially new coordinates
      const { error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      console.error('Error updating location status:', error);
      notify('error', 'Failed to update location status');
    }
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LocationFormData) => {
      if (!data.id) {
        throw new Error('Location ID is required for update');
      }

      // Try to geocode the address with Location object - force fresh lookup on updates
      console.log('🔄 UPDATE: Starting geocoding for location update:', {
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        name: data.name
      });
      
      let coordinates = null;
      try {
        coordinates = await geocodeAddress({
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          name: data.name
        }, true); // Force fresh lookup to recalculate coordinates
        
        if (coordinates) {
          console.log('✅ UPDATE: Geocoding successful:', coordinates);
        } else {
          console.warn('⚠️ UPDATE: Geocoding returned null - no coordinates found');
        }
      } catch (error) {
        console.error('❌ UPDATE: Geocoding failed with exception:', error);
      }

      const updateData = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive,
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      };

      console.log('💾 UPDATE: Database update data:', updateData);
      console.log('🎯 UPDATE: Coordinates included in update:', coordinates ? 'YES' : 'NO');

      const { error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', data.id);
      
      if (error) {
        console.error('💥 UPDATE: Database update failed:', error);
        throw error;
      }
      
      console.log('✅ UPDATE: Database update completed successfully');
      
      // Return coordinates for user feedback
      return { coordinates };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      notify('success', 'Location updated successfully');
      
      // Show coordinate feedback to user
      if (result.coordinates) {
        notify('success', `New coordinates: ${result.coordinates.latitude.toFixed(6)}, ${result.coordinates.longitude.toFixed(6)}`);
      } else {
        notify('warning', 'Coordinates unchanged (geocoding failed)');
      }
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      notify('error', 'Failed to update location');
    }
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const { data: franchiseeProfile } = useFranchiseeProfile();
  
  return useMutation({
    mutationFn: async (data: Omit<LocationFormData, 'id'>) => {
      if (!franchiseeProfile?.id) {
        throw new Error('Franchisee profile is required to create locations');
      }

      // Try to geocode the address with Location object - fresh lookup for new locations
      let coordinates = null;
      try {
        coordinates = await geocodeAddress({
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          name: data.name
        }, true); // Force fresh lookup for new locations
      } catch (error) {
        console.warn('Geocoding failed:', error);
      }

      const insertData = {
        franchisee_id: franchiseeProfile.id,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive,
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      };

      const { error } = await supabase
        .from('locations')
        .insert(insertData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      notify('success', 'Location created successfully');
    },
    onError: (error) => {
      console.error('Error creating location:', error);
      notify('error', 'Failed to create location');
    }
  });
};

// Bulk Actions for Locations
export const useBulkArchiveLocations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationIds: string[]) => {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .in('id', locationIds);
      
      if (error) throw error;
      return locationIds;
    },
    onSuccess: async (locationIds) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
      await queryClient.refetchQueries({ queryKey: ['locations'] });
      notify('success', `${locationIds.length} location${locationIds.length > 1 ? 's' : ''} archived successfully`);
    },
    onError: (error) => {
      console.error('Error bulk archiving locations:', error);
      notify('error', 'Failed to archive locations');
    }
  });
};

export const useBulkUnarchiveLocations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationIds: string[]) => {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: true })
        .in('id', locationIds);
      
      if (error) throw error;
      return locationIds;
    },
    onSuccess: async (locationIds) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
      await queryClient.refetchQueries({ queryKey: ['locations'] });
      notify('success', `${locationIds.length} location${locationIds.length > 1 ? 's' : ''} unarchived successfully`);
    },
    onError: (error) => {
      console.error('Error bulk unarchiving locations:', error);
      notify('error', 'Failed to unarchive locations');
    }
  });
};

export const useBulkDeleteLocations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationIds: string[]) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .in('id', locationIds);
      
      if (error) throw error;
      return locationIds;
    },
    onSuccess: async (locationIds) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
      await queryClient.refetchQueries({ queryKey: ['locations'] });
      notify('success', `${locationIds.length} location${locationIds.length > 1 ? 's' : ''} deleted successfully`);
    },
    onError: (error) => {
      console.error('Error bulk deleting locations:', error);
      notify('error', 'Failed to delete locations');
    }
  });
};

export const useBulkToggleLocationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ locationIds, isActive }: { locationIds: string[]; isActive: boolean }) => {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: isActive })
        .in('id', locationIds);
      
      if (error) throw error;
      return { locationIds, isActive };
    },
    onSuccess: async ({ locationIds, isActive }) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
      await queryClient.refetchQueries({ queryKey: ['locations'] });
      notify('success', `${locationIds.length} location${locationIds.length > 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      console.error('Error bulk toggling location status:', error);
      notify('error', 'Failed to update location status');
    }
  });
};
