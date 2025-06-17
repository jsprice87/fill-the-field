
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useArchiveLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location archived successfully');
    },
    onError: (error) => {
      console.error('Error archiving location:', error);
      toast.error('Failed to archive location');
    }
  });
};

export const useUnarchiveLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .update({ archived_at: null })
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location unarchived successfully');
    },
    onError: (error) => {
      console.error('Error unarchiving location:', error);
      toast.error('Failed to unarchive location');
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
      toast.success('Location deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
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
      toast.error('Failed to update location status');
    }
  });
};
