
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notify';
import { useFranchiseeProfile } from './useFranchiseeProfile';

export interface Franchisee {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  slug: string | null;
  logo_url: string | null;
  website_url?: string | null;
  tagline?: string | null;
  created_at: string;
  updated_at: string;
}

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

export const useFranchiseeBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['franchisee-by-slug', slug],
    queryFn: async (): Promise<Franchisee | null> => {
      if (!slug) {
        return null;
      }

      console.log('Fetching franchisee by slug:', slug);
      
      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching franchisee by slug:', error);
        throw new Error(`Failed to fetch franchisee: ${error.message}`);
      }

      console.log('Franchisee data:', data);
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
