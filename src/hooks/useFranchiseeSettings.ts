
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFranchiseeSettings = () => {
  return useQuery({
    queryKey: ['franchisee-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get the franchisee_id
      const { data: franchisee } = await supabase
        .from('franchisees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!franchisee) throw new Error('Franchisee not found');

      const { data, error } = await supabase
        .from('franchisee_settings')
        .select('*')
        .eq('franchisee_id', franchisee.id);

      if (error) throw error;

      // Convert array to object for easier access
      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);

      return settingsMap;
    }
  });
};

export const useUpdateFranchiseeSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      console.log('Updating setting:', key, value);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get franchisee_id
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (franchiseeError) {
        console.error('Franchisee lookup error:', franchiseeError);
        throw franchiseeError;
      }

      if (!franchisee) throw new Error('Franchisee not found');

      const { data, error } = await supabase
        .from('franchisee_settings')
        .upsert({
          franchisee_id: franchisee.id,
          setting_key: key,
          setting_value: value
        })
        .select()
        .single();

      if (error) {
        console.error('Setting update error:', error);
        throw error;
      }
      
      console.log('Setting updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchisee-settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      console.error('Setting update mutation error:', error);
      toast.error(`Failed to update setting: ${error.message}`);
    }
  });
};
