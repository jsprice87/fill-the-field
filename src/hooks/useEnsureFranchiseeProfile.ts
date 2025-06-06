
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnsureFranchiseeProfile = () => {
  return useMutation({
    mutationFn: async (sourcePath: string = 'manual') => {
      console.log(`Ensuring franchisee profile from ${sourcePath}`);
      
      const { data, error } = await supabase.functions.invoke('ensure-franchisee-profile', {
        body: { sourcePath }
      });

      if (error) {
        console.error('Error ensuring franchisee profile:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to ensure franchisee profile');
      }

      console.log('Franchisee profile ensured:', data);
      return data;
    }
  });
};
