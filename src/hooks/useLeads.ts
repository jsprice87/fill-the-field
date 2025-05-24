
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  franchisee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  status: string;
  source: string;
  notes?: string;
  child_speaks_english?: boolean;
  selected_location_id?: string;
  booking_session_data?: any;
  created_at: string;
  updated_at: string;
}

export const useLeads = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['leads', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          locations:selected_location_id(name)
        `)
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!franchiseeId,
  });
};

export const useLeadStats = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['lead-stats', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) {
        return {
          totalLeads: 0,
          newLeads: 0,
          conversionRate: 0,
          monthlyGrowth: 0
        };
      }
      
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, created_at')
        .eq('franchisee_id', franchiseeId);

      if (error) {
        console.error('Error fetching lead stats:', error);
        throw error;
      }

      const totalLeads = leads?.length || 0;
      const newLeads = leads?.filter(lead => lead.status === 'new').length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

      // Calculate monthly growth (comparing current month to previous month)
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const currentMonthLeads = leads?.filter(lead => 
        new Date(lead.created_at) >= currentMonth
      ).length || 0;

      const previousMonthLeads = leads?.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= previousMonth && leadDate < currentMonth;
      }).length || 0;

      const monthlyGrowth = previousMonthLeads > 0 
        ? Math.round(((currentMonthLeads - previousMonthLeads) / previousMonthLeads) * 100)
        : 0;

      return {
        totalLeads,
        newLeads,
        conversionRate,
        monthlyGrowth
      };
    },
    enabled: !!franchiseeId,
  });
};
