
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
