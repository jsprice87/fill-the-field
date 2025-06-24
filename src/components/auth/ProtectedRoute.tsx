
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { clearFranchiseeProfileCache } from "@/hooks/useFranchiseeProfile";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { Loader } from "@/components/ui/Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  roleRequired?: UserRole;
}

const ProtectedRoute = ({ children, roleRequired = 'user' }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    // Set up listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
        if (event === "SIGNED_OUT") {
          console.log("User signed out, clearing franchisee profile cache");
          clearFranchiseeProfileCache();
        }
      }
    );

    checkAuth();

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null || roleLoading) {
    // Still checking authentication or role
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (roleRequired === 'admin' && role !== 'admin') {
    // User is authenticated but doesn't have admin role - redirect to portal
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
