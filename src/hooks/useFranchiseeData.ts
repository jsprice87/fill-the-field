
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notify';
import { useFranchiseeProfile } from './useFranchiseeProfile';

export const useFranchiseeData = () => {
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useFranchiseeProfile();

  return useQuery({
    queryKey: ['franchisee-data'],
    queryFn: async () => {
      if (!profile) throw new Error('No franchisee profile found');
      return profile; // Return the same data from the profile hook
    },
    enabled: !!profile, // Only run when profile is available
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
    initialData: profile, // Use profile data as initial data
  });
};

export const useUpdateFranchiseeData = () => {
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
      queryClient.invalidateQueries({ queryKey: ['franchisee-data'] });
      queryClient.invalidateQueries({ queryKey: ['franchisee-profile'] });
      notify('success', 'Business information updated successfully');
    },
    onError: (error) => {
      notify('error', 'Failed to update business information');
      console.error('Update error:', error);
    }
  });
};

// temporary alias so existing pages compile and run
export const useFranchiseeBySlug = useFranchiseeData;
