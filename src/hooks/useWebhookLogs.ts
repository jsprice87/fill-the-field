
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEffectiveFranchiseeId, isImpersonating } from '@/utils/impersonationHelpers';
import { toast } from 'sonner';

export const useWebhookLogs = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['webhook-logs', franchiseeId, isImpersonating() ? localStorage.getItem('impersonation-session') : null],
    queryFn: async () => {
      const effectiveFranchiseeId = franchiseeId || await getEffectiveFranchiseeId();
      if (!effectiveFranchiseeId) return [];
      
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('franchisee_id', effectiveFranchiseeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching webhook logs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!franchiseeId || isImpersonating(),
  });
};
