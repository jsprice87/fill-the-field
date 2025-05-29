
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface StatusBadgeProps {
  leadId: string;
  bookingDate?: string;
  fallbackStatus?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ leadId, bookingDate, fallbackStatus }) => {
  // Query to get the actual current status from the database
  const { data: leadData } = useQuery({
    queryKey: ['lead-status', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('id', leadId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
    refetchInterval: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use the database status if available, otherwise fall back to prop
  const actualStatus = leadData?.status || fallbackStatus || 'new';

  const getStatusBadge = (status: string, bookingDate?: string) => {
    const today = new Date();
    const date = bookingDate ? new Date(bookingDate) : null;
    const isPast = date && date < today;
    
    // Auto-determine status for past dates
    const displayStatus = (status === 'booked_upcoming' && isPast) ? 'needs_status' : status;
    
    const variants = {
      'booked_upcoming': 'bg-green-100 text-green-800',
      'booked_complete': 'bg-purple-100 text-purple-800',
      'needs_status': 'bg-orange-100 text-orange-800',
      'no_show': 'bg-red-100 text-red-800',
      'follow_up': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-gray-100 text-gray-800',
      'new': 'bg-blue-100 text-blue-800',
      'closed_lost': 'bg-red-100 text-red-800',
      'closed_won': 'bg-green-100 text-green-800'
    };
    
    const labels = {
      'booked_upcoming': 'Upcoming',
      'booked_complete': 'Complete',
      'needs_status': 'Needs Status',
      'no_show': 'No-Show',
      'follow_up': 'Follow-up',
      'canceled': 'Canceled',
      'new': 'New',
      'closed_lost': 'Closed Lost',
      'closed_won': 'Closed Won'
    };
    
    return (
      <Badge className={variants[displayStatus as keyof typeof variants] || variants.new}>
        {labels[displayStatus as keyof typeof labels] || 'New'}
      </Badge>
    );
  };

  return getStatusBadge(actualStatus, bookingDate);
};

export default StatusBadge;
