
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEffectiveFranchiseeId, isImpersonating } from '@/utils/impersonationHelpers';
import type { Lead } from '@/types';

export const useLeads = (franchiseeId?: string, includeArchived: boolean = false) => {
  return useQuery({
    queryKey: ['leads', franchiseeId, includeArchived, isImpersonating() ? localStorage.getItem('impersonation-session') : null],
    queryFn: async (): Promise<Lead[]> => {
      const effectiveFranchiseeId = franchiseeId || await getEffectiveFranchiseeId();
      if (!effectiveFranchiseeId) return [];
      
      let query = supabase
        .from('leads')
        .select(`
          *,
          locations:selected_location_id(name)
        `)
        .eq('franchisee_id', effectiveFranchiseeId)
        .order('created_at', { ascending: false });

      // Filter by archive status
      if (!includeArchived) {
        query = query.is('archived_at', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!franchiseeId || isImpersonating(),
  });
};

// Separate function to fetch lead stats to avoid deep type inference
const fetchLeadStats = async (franchiseeId: string, includeArchived: boolean = false) => {
  const effectiveFranchiseeId = franchiseeId || await getEffectiveFranchiseeId();
  if (!effectiveFranchiseeId) {
    return {
      totalLeads: 0,
      newLeads: 0,
      conversionRate: 0,
      monthlyGrowth: 0
    };
  }

  let query = supabase
    .from('leads')
    .select('status, created_at')
    .eq('franchisee_id', effectiveFranchiseeId);

  // Exclude archived leads from stats by default
  if (!includeArchived) {
    query = query.is('archived_at', null);
  }

  const { data: leads, error } = await query;

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

export const useLeadStats = (franchiseeId?: string, includeArchived: boolean = false) => {
  return useQuery({
    queryKey: ['lead-stats', franchiseeId, includeArchived, isImpersonating() ? localStorage.getItem('impersonation-session') : null],
    queryFn: async () => {
      if (!franchiseeId && !isImpersonating()) {
        return {
          totalLeads: 0,
          newLeads: 0,
          conversionRate: 0,
          monthlyGrowth: 0
        };
      }
      return await fetchLeadStats(franchiseeId || '', includeArchived);
    },
    enabled: !!franchiseeId || isImpersonating(),
  });
};
