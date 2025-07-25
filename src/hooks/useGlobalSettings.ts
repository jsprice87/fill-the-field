
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGlobalSettings = () => {
  return useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error fetching global settings:', error);
        throw error;
      }

      // Convert array to object for easier access
      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);

      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });
};

export const useGlobalSetting = (settingKey: string) => {
  const { data: settings, ...rest } = useGlobalSettings();
  
  return {
    ...rest,
    data: settings?.[settingKey] || null,
  };
};

type UpdatePayload = { key: string; value: string };

export const useUpdateGlobalSetting = () => {
  const mutation = useMutation({
    mutationFn: async (payload: UpdatePayload) =>
      supabase.from('global_settings').upsert({
        setting_key: payload.key,
        setting_value: payload.value
      }).throwOnError(),
  });

  return {
    update: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: Boolean(mutation.error),
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
