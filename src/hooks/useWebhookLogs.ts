
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

export const useTestWebhook = () => {
  return async (testData: any = {}) => {
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

    // Call the send-webhook function directly using the correct URL
    const response = await fetch('https://ojowhfojaswbbuefxaae.supabase.co/functions/v1/send-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        franchiseeId: franchisee.id,
        eventType: 'test',
        data: {
          message: 'This is a test webhook from Soccer Stars',
          timestamp: new Date().toISOString(),
          ...testData
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Test webhook failed: ${response.status}`);
    }

    return response.json();
  };
};
