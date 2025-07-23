
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEffectiveUserId, isImpersonating } from '@/utils/impersonationHelpers';

export type UserRole = 'admin' | 'user' | 'unknown';

export const useUserRole = () => {
  const [session, setSession] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const [effectiveUserId, setEffectiveUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEffectiveUserId = async () => {
      const userId = await getEffectiveUserId();
      setEffectiveUserId(userId);
    };

    fetchEffectiveUserId();
  }, [session]);

  const { data, isLoading } = useQuery({
    queryKey: ['user-role', effectiveUserId, isImpersonating() ? localStorage.getItem('impersonation-session') : null],
    queryFn: async () => {
      if (!effectiveUserId) return 'unknown';
      
      // Query role from profiles table using effective user ID
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', effectiveUserId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user role:', error);
        return 'unknown' as UserRole;
      }
      
      return (profile?.role || 'user') as UserRole;
    },
    enabled: !!effectiveUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    role: data ?? 'unknown' as UserRole, 
    loading: isLoading 
  };
};
