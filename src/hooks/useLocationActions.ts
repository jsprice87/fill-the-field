
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
      const { error } = await supabase
        .from('locations')
        .update({ is_active: isActive })
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

      // Try to geocode the address with Location object
      let coordinates = null;
      try {
        coordinates = await geocodeAddress({
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip
        });
      } catch (error) {
        console.warn('Geocoding failed:', error);
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

      const { error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      notify('success', 'Location updated successfully');
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

      // Try to geocode the address with Location object
      let coordinates = null;
      try {
        coordinates = await geocodeAddress({
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip
        });
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
