
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFranchiseeProfile = () => {
  return useQuery({
    queryKey: ['franchisee-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: false, // Don't run automatically
    retry: false, // Don't retry on error
    refetchOnWindowFocus: false
  });
};

export const useUpdateFranchiseeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<{
      company_name: string;
      contact_name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    }>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('franchisees')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchisee-profile'] });
      queryClient.invalidateQueries({ queryKey: ['franchisee-data'] });
      toast.success('Business information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update business information');
      console.error('Profile update error:', error);
    }
  });
};
