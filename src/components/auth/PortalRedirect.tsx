
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getSlugFromFranchiseeId } from '@/utils/slugUtils';
import { toast } from 'sonner';

/**
 * Component that redirects users from non-slug portal URLs to their slug-based equivalents
 */
const PortalRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToSlugBasedRoute = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // User not authenticated, redirect to login
          navigate('/login', { replace: true });
          return;
        }

        // Get the franchisee ID and slug
        const { data: franchisee, error } = await supabase
          .from('franchisees')
          .select('id, slug')
          .eq('user_id', session.user.id)
          .single();
        
        if (error || !franchisee) {
          console.error("Error fetching franchisee:", error);
          toast.error("Unable to find franchisee account");
          navigate('/login', { replace: true });
          return;
        }

        // Use slug if available, otherwise use ID
        const slugOrId = franchisee.slug || franchisee.id;
        
        // Replace /portal/ with /{slugOrId}/portal/ in the current path
        const newPath = location.pathname.replace('/portal/', `/${slugOrId}/portal/`);
        
        // Preserve search params and hash
        const fullPath = newPath + location.search + location.hash;
        
        navigate(fullPath, { replace: true });
      } catch (error) {
        console.error("Error in portal redirect:", error);
        toast.error("Failed to load portal");
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    redirectToSlugBasedRoute();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // This component should redirect before rendering anything
  return null;
};

export default PortalRedirect;
