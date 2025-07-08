import { supabase } from "@/integrations/supabase/client";

export const testAdminPolicies = async () => {
  console.log("Testing admin policies...");
  
  // Check current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Current user:", user?.email);
  
  // Check user's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();
  
  console.log("User profile role:", profile?.role);
  
  // Test franchisees query
  const { data: franchisees, error } = await supabase
    .from("franchisees")
    .select("*");
  
  console.log("Franchisees query error:", error);
  console.log("Franchisees count:", franchisees?.length);
  
  return { user, profile, franchisees, error };
};

export const runMigration = async () => {
  const migrationSQL = `
    -- Add admin policies for franchisees table
    
    -- Check if franchisees table has RLS enabled (it should)
    -- If not, enable it
    ALTER TABLE public.franchisees ENABLE ROW LEVEL SECURITY;
    
    -- Policy for regular users to view only their own franchisee record
    CREATE POLICY "Users can view their own franchisee record" 
      ON public.franchisees 
      FOR SELECT 
      USING (user_id = auth.uid());
    
    -- Policy for regular users to update their own franchisee record
    CREATE POLICY "Users can update their own franchisee record"
      ON public.franchisees
      FOR UPDATE
      USING (user_id = auth.uid());
    
    -- Policy for admin users to view all franchisees
    CREATE POLICY "Admin users can view all franchisees"
      ON public.franchisees
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- Policy for admin users to update all franchisees
    CREATE POLICY "Admin users can update all franchisees"
      ON public.franchisees
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- Policy for admin users to insert new franchisees
    CREATE POLICY "Admin users can insert franchisees"
      ON public.franchisees
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    -- Policy for admin users to delete franchisees
    CREATE POLICY "Admin users can delete franchisees"
      ON public.franchisees
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  `;
  
  try {
    // Note: This won't work with the regular client, but we can check the policies
    console.log("Migration SQL:", migrationSQL);
    return migrationSQL;
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
};