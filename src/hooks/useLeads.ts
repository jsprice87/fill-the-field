
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

// Separate function to fetch lead stats to avoid deep type inference
const fetchLeadStats = async (franchiseeId: string) => {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('status, created_at')
    .eq('franchisee_id', franchiseeId);

  if (error) {
    console.error('Error fetching lead stats:', error);
    throw error;
  }

  const leadsArray = leads || [];
  const totalLeads = leadsArray.length;
  
  // Use simple filter operations to avoid deep type inference
  const newLeads = leadsArray.filter(lead => lead.status === 'new').length;
  const convertedLeads = leadsArray.filter(lead => 
    ['booked_upcoming', 'booked_complete', 'closed_won'].includes(lead.status)
  ).length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Calculate monthly growth
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthLeads = leadsArray.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= currentMonth;
  }).length;

  const previousMonthLeads = leadsArray.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= previousMonth && leadDate < currentMonth;
  }).length;

  const monthlyGrowth = previousMonthLeads > 0 
    ? Math.round(((currentMonthLeads - previousMonthLeads) / previousMonthLeads) * 100)
    : 0;

  return {
    totalLeads,
    newLeads,
    conversionRate,
    monthlyGrowth
  };
};

export const useLeadStats = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['lead-stats', franchiseeId],
    queryFn: () => {
      if (!franchiseeId) {
        return {
          totalLeads: 0,
          newLeads: 0,
          conversionRate: 0,
          monthlyGrowth: 0
        };
      }
      return fetchLeadStats(franchiseeId);
    },
    enabled: !!franchiseeId,
  });
};
