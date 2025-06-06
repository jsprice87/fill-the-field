
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFranchiseeData = () => {
  return useQuery({
    queryKey: ['franchisee-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) throw error;
      
      if (!data) {
        console.error('No franchisee record found for user:', user.id);
        throw new Error('Profile not found - please contact support or re-register');
      }
      
      return data;
    }
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
      toast.success('Business information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update business information');
      console.error('Update error:', error);
    }
  });
};
