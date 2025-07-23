
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { clearFranchiseeProfileCache } from "@/hooks/useFranchiseeProfile";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "@mantine/core";

interface ProtectedRouteProps {
  children: ReactNode;
  roleRequired?: UserRole;
}

const ProtectedRoute = ({ children, roleRequired = 'user' }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { role, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // Handle auth errors by clearing corrupted tokens
        if (error && error.message.includes('refresh_token_not_found')) {
          console.log('Refresh token error detected, clearing auth state');
          await supabase.auth.signOut();
          queryClient.clear();
          clearFranchiseeProfileCache();
          setIsAuthenticated(false);
          return;
        }
        
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
          console.log("User signed out, clearing all caches");
          clearFranchiseeProfileCache();
          queryClient.clear(); // Clear all React Query cache
          sessionStorage.clear(); // Clear session storage
          localStorage.removeItem('franchisee_profile_ensured');
          localStorage.removeItem('impersonation-session'); // Clear impersonation
        }
        
        if (event === "SIGNED_IN") {
          console.log("User signed in, clearing caches to prevent data contamination");
          queryClient.clear(); // Clear all React Query cache on sign in too
          clearFranchiseeProfileCache();
        }
        
        if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
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
          <Loader size="lg" />
          <p className="text-gray-600 mt-4">Checking authentication...</p>
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
