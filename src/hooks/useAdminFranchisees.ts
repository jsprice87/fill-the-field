
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminFranchisees = () => {
  return useQuery({
    queryKey: ["admin-franchisees"],
    queryFn: async () => {
      console.log("Fetching franchisees for admin...");
      
      // First, let's check the user's auth details
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        throw userError;
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user");
      }
      
      console.log("Current user:", user?.email);
      
      // Check user's role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      console.log("User profile role:", profile?.role);
      
      if (profile?.role !== 'admin') {
        console.error("User is not an admin, role:", profile?.role);
        throw new Error("Insufficient permissions: User is not an admin");
      }
      
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
    retry: 1,
    retryDelay: 1000,
  });
};
