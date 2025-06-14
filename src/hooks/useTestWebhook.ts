
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
        const eventType = data.type === 'newLead' ? 'lead' : 'booking';
        toast.success(`Test ${eventType} webhook sent successfully ✔︎`);
      } else if (data?.error === 'webhook_not_listening') {
        toast.error('Workflow not listening – press ▶︎ Execute Workflow in n8n and try again');
      } else {
        const statusInfo = data?.status ? ` (HTTP ${data.status})` : '';
        const errorMsg = data?.response || data?.error || 'Unknown error';
        toast.error(`Test webhook failed${statusInfo}: ${errorMsg}`);
      }
    },
    onError: (error) => {
      console.error('Test webhook mutation error:', error);
      toast.error(`Failed to send test webhook: ${error.message}`);
    }
  });
};
