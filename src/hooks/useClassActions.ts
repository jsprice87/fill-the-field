import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showNotification } from '@mantine/notifications';

// Individual class actions
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId: string) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: 'Class deleted successfully'
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete class'
      });
    }
  });
};

export const useArchiveClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', classId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: 'Class archived successfully'
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Archive Failed',
        message: error.message || 'Failed to archive class'
      });
    }
  });
};

export const useUnarchiveClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: true })
        .eq('id', classId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: 'Class unarchived successfully'
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Unarchive Failed',
        message: error.message || 'Failed to unarchive class'
      });
    }
  });
};

// Bulk class actions
export const useBulkArchiveClasses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classIds: string[]) => {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .in('id', classIds);
      
      if (error) throw error;
      return classIds;
    },
    onSuccess: async (classIds) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      await queryClient.refetchQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: `${classIds.length} class${classIds.length > 1 ? 'es' : ''} archived successfully`
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Bulk Archive Failed',
        message: error.message || 'Failed to archive classes'
      });
    }
  });
};

export const useBulkUnarchiveClasses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classIds: string[]) => {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: true })
        .in('id', classIds);
      
      if (error) throw error;
      return classIds;
    },
    onSuccess: async (classIds) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      await queryClient.refetchQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: `${classIds.length} class${classIds.length > 1 ? 'es' : ''} unarchived successfully`
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Bulk Unarchive Failed',
        message: error.message || 'Failed to unarchive classes'
      });
    }
  });
};

export const useBulkDeleteClasses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classIds: string[]) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .in('id', classIds);
      
      if (error) throw error;
      return classIds;
    },
    onSuccess: async (classIds) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      await queryClient.refetchQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: `${classIds.length} class${classIds.length > 1 ? 'es' : ''} deleted successfully`
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Bulk Delete Failed',
        message: error.message || 'Failed to delete classes'
      });
    }
  });
};

export const useBulkToggleClassStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classIds, isActive }: { classIds: string[]; isActive: boolean }) => {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: isActive })
        .in('id', classIds);
      
      if (error) throw error;
      return { classIds, isActive };
    },
    onSuccess: async ({ classIds, isActive }) => {
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      await queryClient.refetchQueries({ queryKey: ['classes'] });
      showNotification({
        color: 'green',
        title: 'Success',
        message: `${classIds.length} class${classIds.length > 1 ? 'es' : ''} ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    },
    onError: (error: any) => {
      showNotification({
        color: 'red',
        title: 'Bulk Status Update Failed',
        message: error.message || 'Failed to update class status'
      });
    }
  });
};