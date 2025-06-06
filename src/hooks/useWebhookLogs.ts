
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWebhookLogs = (limit: number = 10) => {
  return useQuery({
    queryKey: ['webhook-logs', limit],
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
        .from('webhook_logs')
        .select('*')
        .eq('franchisee_id', franchisee.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }
  });
};

export const useTestLeadWebhook = () => {
  return async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get franchisee_id
    const { data: franchisee } = await supabase
      .from('franchisees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!franchisee) throw new Error('Franchisee not found');

    // Get the session token for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const testLeadData = {
      first_name: "Cortney",
      last_name: "Price", 
      email: "test@example.com",
      phone: "3031234567",
      zip: "80110"
    };

    // Call the send-webhook function directly using the correct URL
    const response = await fetch('https://ojowhfojaswbbuefxaae.supabase.co/functions/v1/send-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        franchiseeId: franchisee.id,
        eventType: 'lead_created',
        data: testLeadData
      })
    });

    if (!response.ok) {
      throw new Error(`Test lead webhook failed: ${response.status}`);
    }

    return response.json();
  };
};

export const useTestBookingWebhook = () => {
  return async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get franchisee_id
    const { data: franchisee } = await supabase
      .from('franchisees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!franchisee) throw new Error('Franchisee not found');

    // Get the session token for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const testBookingData = {
      booking_reference: "ABCD1234",
      class_schedule_name: "Monday Morning Soccer",
      class_date: "2025-06-10",
      class_time: "9:00 AM",
      participant_names: "Ada Price, Sam Smith",
      parent_first_name: "Cortney",
      parent_last_name: "Price"
    };

    // Call the send-webhook function directly using the correct URL
    const response = await fetch('https://ojowhfojaswbbuefxaae.supabase.co/functions/v1/send-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        franchiseeId: franchisee.id,
        eventType: 'booking_created',
        data: testBookingData
      })
    });

    if (!response.ok) {
      throw new Error(`Test booking webhook failed: ${response.status}`);
    }

    return response.json();
  };
};
