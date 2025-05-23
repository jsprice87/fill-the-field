
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminFranchisees = () => {
  return useQuery({
    queryKey: ["admin-franchisees"],
    queryFn: async () => {
      console.log("Fetching franchisees for admin...");
      
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

      console.log("Fetched franchisees:", data);
      return data || [];
    },
  });
};
