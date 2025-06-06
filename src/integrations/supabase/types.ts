export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          age_override: boolean | null
          archived_at: string | null
          booking_id: string
          class_name: string
          class_schedule_id: string
          class_time: string
          created_at: string
          health_conditions: string | null
          id: string
          participant_age: number
          participant_birth_date: string | null
          participant_name: string
          selected_date: string | null
          updated_at: string
        }
        Insert: {
          age_override?: boolean | null
          archived_at?: string | null
          booking_id: string
          class_name: string
          class_schedule_id: string
          class_time: string
          created_at?: string
          health_conditions?: string | null
          id?: string
          participant_age: number
          participant_birth_date?: string | null
          participant_name: string
          selected_date?: string | null
          updated_at?: string
        }
        Update: {
          age_override?: boolean | null
          archived_at?: string | null
          booking_id?: string
          class_name?: string
          class_schedule_id?: string
          class_time?: string
          created_at?: string
          health_conditions?: string | null
          id?: string
          participant_age?: number
          participant_birth_date?: string | null
          participant_name?: string
          selected_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_class_schedule_id_fkey"
            columns: ["class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_flows: {
        Row: {
          created_at: string
          expires_at: string
          flow_id: string
          franchisee_id: string
          id: string
          state_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          flow_id: string
          franchisee_id: string
          id?: string
          state_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          flow_id?: string
          franchisee_id?: string
          id?: string
          state_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_flows_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          archived_at: string | null
          booking_reference: string | null
          cancellation_reason: string | null
          child_speaks_english: boolean | null
          class_schedule_id: string
          communication_permission: boolean | null
          confirmation_email_sent: boolean | null
          created_at: string
          id: string
          lead_id: string
          marketing_permission: boolean | null
          parent_email: string | null
          parent_first_name: string | null
          parent_last_name: string | null
          parent_phone: string | null
          parent_relationship: string | null
          parent_zip: string | null
          updated_at: string
          waiver_accepted: boolean | null
          waiver_accepted_at: string | null
        }
        Insert: {
          archived_at?: string | null
          booking_reference?: string | null
          cancellation_reason?: string | null
          child_speaks_english?: boolean | null
          class_schedule_id: string
          communication_permission?: boolean | null
          confirmation_email_sent?: boolean | null
          created_at?: string
          id?: string
          lead_id: string
          marketing_permission?: boolean | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          parent_phone?: string | null
          parent_relationship?: string | null
          parent_zip?: string | null
          updated_at?: string
          waiver_accepted?: boolean | null
          waiver_accepted_at?: string | null
        }
        Update: {
          archived_at?: string | null
          booking_reference?: string | null
          cancellation_reason?: string | null
          child_speaks_english?: boolean | null
          class_schedule_id?: string
          communication_permission?: boolean | null
          confirmation_email_sent?: boolean | null
          created_at?: string
          id?: string
          lead_id?: string
          marketing_permission?: boolean | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          parent_phone?: string | null
          parent_relationship?: string | null
          parent_zip?: string | null
          updated_at?: string
          waiver_accepted?: boolean | null
          waiver_accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_class_schedule_id_fkey"
            columns: ["class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_id: string
          created_at: string
          current_bookings: number | null
          date_end: string | null
          date_start: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          current_bookings?: number | null
          date_end?: string | null
          date_start?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          current_bookings?: number | null
          date_end?: string | null
          date_start?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_name: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          location_id: string
          max_age: number | null
          max_capacity: number
          min_age: number | null
          name: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          location_id: string
          max_age?: number | null
          max_capacity: number
          min_age?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_id?: string
          max_age?: number | null
          max_capacity?: number
          min_age?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_settings: {
        Row: {
          created_at: string
          franchisee_id: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          franchisee_id: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          franchisee_id?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_settings_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisees: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          logo_url: string | null
          phone: string | null
          slug: string | null
          state: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          slug?: string | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          slug?: string | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          button_text: string | null
          created_at: string
          custom_css: string | null
          custom_js: string | null
          description: string | null
          franchisee_id: string
          hero_image_url: string | null
          id: string
          is_published: boolean | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          franchisee_id: string
          hero_image_url?: string | null
          id?: string
          is_published?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          franchisee_id?: string
          hero_image_url?: string | null
          id?: string
          is_published?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archived_at: string | null
          booking_session_data: Json | null
          child_speaks_english: boolean | null
          created_at: string
          email: string
          first_name: string
          franchisee_id: string
          id: string
          last_name: string
          notes: string | null
          phone: string
          selected_location_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          status_manually_set: boolean
          updated_at: string
          zip: string
        }
        Insert: {
          archived_at?: string | null
          booking_session_data?: Json | null
          child_speaks_english?: boolean | null
          created_at?: string
          email: string
          first_name: string
          franchisee_id: string
          id?: string
          last_name: string
          notes?: string | null
          phone: string
          selected_location_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_manually_set?: boolean
          updated_at?: string
          zip: string
        }
        Update: {
          archived_at?: string | null
          booking_session_data?: Json | null
          child_speaks_english?: boolean | null
          created_at?: string
          email?: string
          first_name?: string
          franchisee_id?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string
          selected_location_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_manually_set?: boolean
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_selected_location_id_fkey"
            columns: ["selected_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          city: string
          created_at: string
          description: string | null
          email: string | null
          franchisee_id: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          state: string
          updated_at: string
          website: string | null
          zip: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          description?: string | null
          email?: string | null
          franchisee_id: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          state: string
          updated_at?: string
          website?: string | null
          zip: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          franchisee_id?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          state?: string
          updated_at?: string
          website?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          age: number
          age_override: boolean | null
          birth_date: string | null
          booking_id: string
          computed_age: string | null
          created_at: string
          first_name: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          age: number
          age_override?: boolean | null
          birth_date?: string | null
          booking_id: string
          computed_age?: string | null
          created_at?: string
          first_name: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          age?: number
          age_override?: boolean | null
          birth_date?: string | null
          booking_id?: string
          computed_age?: string | null
          created_at?: string
          first_name?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_creation_audit: {
        Row: {
          created_at: string | null
          error_message: string | null
          franchisee_id: string | null
          generated_slug: string | null
          id: string
          source_path: string
          success: boolean | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          franchisee_id?: string | null
          generated_slug?: string | null
          id?: string
          source_path: string
          success?: boolean | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          franchisee_id?: string | null
          generated_slug?: string | null
          id?: string
          source_path?: string
          success?: boolean | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_creation_audit_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      program_suggestions: {
        Row: {
          comment: string | null
          created_at: string
          email: string | null
          franchisee_id: string
          id: string
          updated_at: string
          zip: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          email?: string | null
          franchisee_id: string
          id?: string
          updated_at?: string
          zip: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          email?: string | null
          franchisee_id?: string
          id?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_suggestions_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_exceptions: {
        Row: {
          class_schedule_id: string
          created_at: string
          exception_date: string
          id: string
          is_cancelled: boolean
          updated_at: string
        }
        Insert: {
          class_schedule_id: string
          created_at?: string
          exception_date: string
          id?: string
          is_cancelled?: boolean
          updated_at?: string
        }
        Update: {
          class_schedule_id?: string
          created_at?: string
          exception_date?: string
          id?: string
          is_cancelled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_exceptions_class_schedule_id_fkey"
            columns: ["class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_type: string
          franchisee_id: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          franchisee_id: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          franchisee_id?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_booking_flows: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_lead_status_from_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      lead_status:
        | "new"
        | "booked_upcoming"
        | "booked_complete"
        | "no_show"
        | "follow_up"
        | "canceled"
        | "closed_lost"
        | "closed_won"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_status: [
        "new",
        "booked_upcoming",
        "booked_complete",
        "no_show",
        "follow_up",
        "canceled",
        "closed_lost",
        "closed_won",
      ],
    },
  },
} as const
