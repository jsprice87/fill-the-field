
import { Database } from '@/integrations/supabase/types';

declare module '@/integrations/supabase/types' {
  interface Database {
    public: {
      Tables: Database['public']['Tables'] & {
        profiles: {
          Row: { 
            id: string; 
            email: string | null; 
            role: string;
            created_at: string;
            updated_at: string;
          };
          Insert: { 
            id: string; 
            email?: string | null; 
            role?: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: { 
            id?: string; 
            email?: string | null; 
            role?: string;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  }
}
