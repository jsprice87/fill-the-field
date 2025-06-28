
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getSlugFromFranchiseeId } from "@/utils/slugUtils";

/**
 * Component that automatically updates old UUID-based URLs to slug-based URLs
 * This can be mounted at the app level to handle the transition
 */
const MigrateUserUrls = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkAndMigrateUrl = async () => {
      try {
        // Check if we're on a franchisee page (not admin)
        if (!location.pathname.startsWith('/admin/')) {
          // Extract potential franchisee ID from the URL
          const match = location.pathname.match(/^\/([^/]+)/);
          
          if (match && match[1]) {
            const potentialId = match[1];
            
            // Check if it's a UUID pattern
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            if (uuidPattern.test(potentialId)) {
              // Get the current user's session
              const { data: { session } } = await supabase.auth.getSession();
              
              // Only redirect if this is the currently logged in user
              if (session?.user && session.user.id === potentialId) {
                // Get the slug for this user
                const slug = await getSlugFromFranchiseeId(potentialId);
                
                if (slug) {
                  // Replace the UUID with the slug in the URL and navigate
                  const newPath = location.pathname.replace(potentialId, slug);
                  navigate(newPath, { replace: true });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error migrating URL:", error);
      }
    };
    
    checkAndMigrateUrl();
  }, [location.pathname, navigate]);
  
  // This component doesn't render anything
  return null;
};

export default MigrateUserUrls;
