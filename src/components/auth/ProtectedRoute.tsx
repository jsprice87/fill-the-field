
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEnsureFranchiseeProfile } from "@/hooks/useEnsureFranchiseeProfile";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProfileEnsured, setIsProfileEnsured] = useState<boolean | null>(null);
  const ensureFranchiseeProfile = useEnsureFranchiseeProfile();

  useEffect(() => {
    const checkAuthAndEnsureProfile = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session;
        setIsAuthenticated(isAuth);
        
        if (isAuth && data.session?.user) {
          // Trigger the safety net to ensure profile exists
          try {
            await ensureFranchiseeProfile.mutateAsync('protected_route');
            setIsProfileEnsured(true);
          } catch (error) {
            console.error('Failed to ensure profile in ProtectedRoute:', error);
            // Don't block access, let the individual components handle the fallback
            setIsProfileEnsured(true);
          }
        } else {
          setIsProfileEnsured(true); // No need to check if not authenticated
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsProfileEnsured(true);
      }
    };

    // Set up listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in, ensuring profile...");
          try {
            await ensureFranchiseeProfile.mutateAsync('sign_in');
            setIsProfileEnsured(true);
          } catch (error) {
            console.error('Failed to ensure profile on sign in:', error);
            setIsProfileEnsured(true);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setIsProfileEnsured(true);
        } else {
          setIsProfileEnsured(true);
        }
      }
    );

    checkAuthAndEnsureProfile();

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [ensureFranchiseeProfile]);

  if (isAuthenticated === null || isProfileEnsured === null) {
    // Still checking authentication or ensuring profile
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isAuthenticated === null ? 'Checking authentication...' : 'Setting up your profile...'}
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
