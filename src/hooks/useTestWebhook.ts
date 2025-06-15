
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFranchiseeProfile } from './useFranchiseeProfile';

interface TestWebhookPayload {
  type: 'newLead' | 'newBooking';
}

export const useTestWebhook = () => {
  const { data: profile } = useFranchiseeProfile();

  return useMutation({
    mutationFn: async (payload: TestWebhookPayload) => {
      if (!profile?.id) {
        throw new Error('No franchisee profile found');
      }

      console.log('Sending test webhook via send-webhook function:', payload);
      
      // Create a mock unified webhook payload for testing
      const mockPayload = {
        event_type: payload.type,
        timestamp: new Date().toISOString(),
        franchisee_id: profile.id,
        franchisee_name: profile.company_name || "Test Soccer Stars",
        sender_name: profile.sender_name || profile.company_name || "Test Soccer Stars",
        business_email: profile.business_email || "",
        lead: {
          id: "test-lead-id",
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          zip: "12345"
        },
        booking: payload.type === 'newBooking' ? {
          id: "test-booking-id",
          booking_reference: "TEST123",
          class_name: "Soccer Stars - Minis",
          class_date: "2025-06-15",
          class_time: "10:00",
          location_name: "Test Soccer Field",
          location_address: "123 Soccer St, Test City, CO",
          participants: [
            { name: "Emma Doe", age: 4, dob: "2021-02-15" }
          ],
          parent_first: "John",
          parent_last: "Doe"
        } : {
          id: "",
          booking_reference: "",
          class_name: "",
          class_date: "",
          class_time: "",
          location_name: "",
          location_address: "",
          participants: [],
          parent_first: "",
          parent_last: ""
        }
      };

      // Call the unified send-webhook function with test mode header
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          franchiseeId: profile.id,
          eventType: payload.type,
          data: mockPayload
        },
        headers: {
          'x-webhook-mode': 'test'
        }
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
        const webhookType = data.event_type || payload.type;
        toast.success(`Test ${webhookType} webhook sent successfully ✔︎`);
      } else if (data?.error === 'webhook_not_listening') {
        toast.error('Workflow not listening – press ▶︎ Execute Workflow in n8n and try again');
      } else if (data?.error === 'no_webhook_url') {
        toast.error('Add a Test Webhook URL in Settings to enable test webhooks');
      } else {
        const statusInfo = data?.response_status ? ` (HTTP ${data.response_status})` : '';
        const errorMsg = data?.response_body || data?.error_message || 'Unknown error';
        toast.error(`Test webhook failed${statusInfo}: ${errorMsg}`);
      }
    },
    onError: (error) => {
      console.error('Test webhook mutation error:', error);
      toast.error(`Failed to send test webhook: ${error.message}`);
    }
  });
};
