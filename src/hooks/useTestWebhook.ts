
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestWebhookPayload {
  type: 'newLead' | 'newBooking';
  url: string;
}

export const useTestWebhook = () => {
  return useMutation({
    mutationFn: async (payload: TestWebhookPayload) => {
      console.log('Sending test webhook:', payload);
      
      const { data, error } = await supabase.functions.invoke('send-test-webhook', {
        body: payload
      });

      if (error) {
        console.error('Test webhook error:', error);
        throw error;
      }
      
      console.log('Test webhook response:', data);
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error(`Test webhook failed: ${data?.error || 'Unknown error'}`);
      }
    },
    onError: (error) => {
      console.error('Test webhook mutation error:', error);
      toast.error(`Failed to send test webhook: ${error.message}`);
    }
  });
};
