import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateLeadStatusParams {
  leadId: string;
  status: string;
}

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, status }: UpdateLeadStatusParams) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status,
          status_manually_set: true, // Override any automated status setting
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch lead queries
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast.success('Lead status updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update lead status:', error);
      toast.error('Failed to update lead status');
    },
  });
};