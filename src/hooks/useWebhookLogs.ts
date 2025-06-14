
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWebhookLogs = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['webhook-logs', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching webhook logs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!franchiseeId,
  });
};
