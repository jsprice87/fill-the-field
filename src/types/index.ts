
// Canonical types - single source of truth
// Re-export and extend Supabase generated types

import type { Database } from '@/integrations/supabase/types';

// Core entity types from Supabase
export type Lead = Database['public']['Tables']['leads']['Row'] & {
  locations?: {
    name: string;
  };
};

export type Booking = Database['public']['Tables']['bookings']['Row'] & {
  participants: Array<{
    id: string;
    first_name: string;
    age: number;
    computed_age: string | null;
  }>;
  class_schedules: {
    start_time: string;
    end_time: string;
    classes: {
      name: string;
      class_name: string;
      locations: {
        name: string;
      };
    };
  } | null;
  status: 'booked_upcoming' | 'attended' | 'no_show' | 'cancelled';
  selected_date: string; // Add the missing selected_date property
};

// Status types
export type LeadStatus = Database['public']['Enums']['lead_status'];

// Mutation parameter types
export interface UpdateStatusParams {
  entity: 'booking' | 'lead';
  id: string;
  status: LeadStatus;
}
