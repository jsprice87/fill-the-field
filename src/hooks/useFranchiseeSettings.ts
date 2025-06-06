
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFranchiseeProfile } from './useFranchiseeProfile';

export const useFranchiseeSettings = () => {
  const { data: profile, isLoading: isProfileLoading } = useFranchiseeProfile();

  return useQuery({
    queryKey: ['franchisee-settings'],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No franchisee profile found');

      const { data, error } = await supabase
        .from('franchisee_settings')
        .select('*')
        .eq('franchisee_id', profile.id);

      if (error) throw error;

      // Convert array to object for easier access
      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);

      return settingsMap;
    },
    enabled: !!profile?.id, // Only run when we have a franchisee ID
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
};

export const useUpdateFranchiseeSetting = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useFranchiseeProfile();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      console.log('Updating setting:', key, value);
      
      if (!profile?.id) throw new Error('No franchisee profile found');

      const { data, error } = await supabase
        .from('franchisee_settings')
        .upsert({
          franchisee_id: profile.id,
          setting_key: key,
          setting_value: value
        }, {
          onConflict: 'franchisee_id,setting_key'
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
