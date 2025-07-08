
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminFranchisees = () => {
  return useQuery({
    queryKey: ["admin-franchisees"],
    queryFn: async () => {
      console.log("Fetching franchisees for admin...");
      
      // First, let's check the user's auth details
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.email);
      
      // Check user's role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();
      
      console.log("User profile role:", profile?.role);
      
      // First, let's check the total count
      const { count: totalCount, error: countError } = await supabase
        .from("franchisees")
        .select("*", { count: "exact", head: true });
      
      if (countError) {
        console.error("Error counting franchisees:", countError);
      } else {
        console.log("Total franchisees count:", totalCount);
      }
      
      const { data, error } = await supabase
        .from("franchisees")
        .select(`
          id,
          company_name,
          contact_name,
          email,
          phone,
          subscription_status,
          subscription_tier,
          subscription_start_date,
          subscription_end_date,
          created_at,
          updated_at,
          slug,
          city,
          state
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching franchisees:", error);
        throw error;
      }

      console.log("Fetched franchisees count:", data?.length);
      console.log("Fetched franchisees:", data);
      return data || [];
    },
  });
};
