
import '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface Database {
    public: {
      Tables: {
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
