
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type LeadStatus = 
  | 'new'
  | 'booked_upcoming' 
  | 'booked_complete'
  | 'no_show'
  | 'follow_up'
  | 'canceled'
  | 'closed_lost'
  | 'closed_won';

export interface Lead {
  id: string;
  franchisee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  status: LeadStatus;
  source: string;
  notes?: string;
  child_speaks_english?: boolean;
  selected_location_id?: string;
  booking_session_data?: any;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  body: string;
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

export const useLead = (leadId?: string) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      if (!leadId) return null;
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          locations:selected_location_id(name),
          bookings(
            id,
            created_at,
            appointments(
              id,
              selected_date,
              class_time,
              class_name,
              participant_name,
              participant_age,
              participant_birth_date,
              class_schedules(
                classes(
                  location_id,
                  locations(name)
                )
              )
            )
          )
        `)
        .eq('id', leadId)
        .single();

      if (error) {
        console.error('Error fetching lead:', error);
        throw error;
      }

      return data;
    },
    enabled: !!leadId,
  });
};

export const useLeadNotes = (leadId?: string) => {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead notes:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!leadId,
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      console.log('Updating lead status:', { leadId, status });
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select();

      if (error) {
        console.error('Error updating lead status:', error);
        throw error;
      }

      console.log('Lead status updated successfully:', data);
      return data;
    },
    onMutate: async ({ leadId, status }) => {
      console.log('Optimistic update starting for lead:', { leadId, status });
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      await queryClient.cancelQueries({ queryKey: ['lead', leadId] });
      
      // Snapshot the previous values
      const previousLeads = queryClient.getQueryData(['leads']);
      const previousBookings = queryClient.getQueryData(['bookings']);
      const previousLead = queryClient.getQueryData(['lead', leadId]);
      
      // Optimistically update leads
      queryClient.setQueryData(['leads'], (old: any) => {
        if (!old) return old;
        return old.map((lead: any) => 
          lead.id === leadId ? { ...lead, status } : lead
        );
      });
      
      // Optimistically update individual lead
      queryClient.setQueryData(['lead', leadId], (old: any) => {
        if (!old) return old;
        return { ...old, status };
      });
      
      // Optimistically update bookings (derive status from lead)
      queryClient.setQueryData(['bookings'], (old: any) => {
        if (!old) return old;
        return old.map((booking: any) => 
          booking.lead_id === leadId ? { ...booking, status } : booking
        );
      });
      
      console.log('Optimistic updates applied for lead');
      return { previousLeads, previousBookings, previousLead };
    },
    onSuccess: (data, variables) => {
      console.log('Lead status mutation successful, invalidating queries...', data);
      
      // Force refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      
      toast.success('Status updated successfully');
    },
    onError: (error, variables, context) => {
      console.error('Lead status mutation failed:', error);
      
      // Rollback optimistic updates
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
      if (context?.previousLead) {
        queryClient.setQueryData(['lead', variables.leadId], context.previousLead);
      }
      
      toast.error('Failed to update status');
    }
  });
};

export const useAddLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, body }: { leadId: string; body: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          author_id: userData.user.id,
          body: body.trim()
        })
        .select();

      if (error) {
        console.error('Error adding lead note:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', variables.leadId] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Failed to add note:', error);
      toast.error('Failed to add note');
    }
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
