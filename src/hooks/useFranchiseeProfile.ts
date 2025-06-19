
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notify';
import { useEnsureFranchiseeProfile } from './useEnsureFranchiseeProfile';

// Session storage key for safety net check
const SAFETY_NET_KEY = 'franchisee_profile_ensured';

const hasSessionSafetyNetRun = (): boolean => {
  try {
    const ensured = sessionStorage.getItem(SAFETY_NET_KEY);
    return ensured === 'true';
  } catch {
    return false;
  }
};

const markSessionSafetyNetRun = (): void => {
  try {
    sessionStorage.setItem(SAFETY_NET_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
};

const clearSessionSafetyNet = (): void => {
  try {
    sessionStorage.removeItem(SAFETY_NET_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const useFranchiseeProfile = () => {
  const ensureFranchiseeProfile = useEnsureFranchiseeProfile();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['franchisee-profile'],
    queryFn: async () => {
      console.log('useFranchiseeProfile: Starting query');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get existing franchisee record first
      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If franchisee exists, mark safety net as run and return
      if (data) {
        markSessionSafetyNetRun();
        console.log('useFranchiseeProfile: Found existing franchisee record');
        return data;
      }
      
      // If no franchisee record and safety net hasn't run this session
      if (!hasSessionSafetyNetRun()) {
        console.log('useFranchiseeProfile: No record found, triggering safety net...');
        
        try {
          const result = await ensureFranchiseeProfile.mutateAsync('profile_query');
          markSessionSafetyNetRun();
          
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
      
      // If safety net already ran this session but still no record, something's wrong
      throw new Error('Profile not found. Please try refreshing the page or contact support.');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - generous stale time to prevent automatic refetches
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection time
    retry: 1, // Only retry once to prevent loops
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't automatically refetch on mount
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
      notify('success', 'Business information updated successfully');
    },
    onError: (error) => {
      notify('error', 'Failed to update business information');
      console.error('Profile update error:', error);
    }
  });
};

// Clear safety net cache on sign out
export const clearFranchiseeProfileCache = () => {
  clearSessionSafetyNet();
};
