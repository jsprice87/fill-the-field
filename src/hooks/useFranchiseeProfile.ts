
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEnsureFranchiseeProfile } from './useEnsureFranchiseeProfile';

export const useFranchiseeProfile = () => {
  const ensureFranchiseeProfile = useEnsureFranchiseeProfile();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['franchisee-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no franchisee record exists, use the safety net to create one
      if (!data) {
        console.log('No franchisee record found, triggering safety net...');
        
        try {
          const result = await ensureFranchiseeProfile.mutateAsync('profile_query');
          
          if (result?.franchisee) {
            // Invalidate and refetch to get the fresh data
            queryClient.invalidateQueries({ queryKey: ['franchisee-profile'] });
            return result.franchisee;
          }
        } catch (safetyNetError) {
          console.error('Safety net failed:', safetyNetError);
          throw new Error('Profile not found and could not be created automatically. Please contact support.');
        }
      }
      
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
