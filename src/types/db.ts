
// Database types - exactly as they come from Supabase (ISO string dates)
export interface DbClass {
  id: string;
  created_at: string;
  updated_at: string;
  location_id: string;
  name: string;
  class_name: string;
  description: string | null;
  duration_minutes: number;
  max_capacity: number;
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
}

export interface DbClassSchedule {
  id: string;
  created_at: string;
  updated_at: string;
  class_id: string;
  start_time: string;
  end_time: string;
  day_of_week: number | null;
  current_bookings: number;
  is_active: boolean;
  date_start: string | null;
  date_end: string | null;
  classes: DbClass & {
    locations: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string | null;
      email: string | null;
      website: string | null;
    };
  };
}

// Input types for database operations
export interface DbClassInput {
  name: string;
  class_name: string;
  description?: string;
  duration_minutes: number;
  max_capacity: number;
  min_age?: number;
  max_age?: number;
  location_id: string;
  is_active?: boolean;
}

export interface DbClassScheduleInput {
  class_id: string;
  start_time: string;
  end_time: string;
  date_start: string | null;
  date_end: string | null;
  day_of_week: number;
  current_bookings?: number;
  is_active?: boolean;
}
