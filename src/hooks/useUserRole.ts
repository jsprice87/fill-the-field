
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'franchisee' | 'unknown';

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

  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return 'unknown';
      
      // For now, check if user email contains 'admin' as a simple role check
      // This will be replaced with proper role column once migration is done
      const userEmail = session?.user?.email;
      if (userEmail?.includes('admin')) {
        return 'admin' as UserRole;
      }
      
      // Try to get role from franchisees table (temporary solution)
      const { data: franchisee, error } = await supabase
        .from('franchisees')
        .select('email')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user role:', error);
        return 'unknown' as UserRole;
      }
      
      return 'franchisee' as UserRole;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    role: data ?? 'unknown' as UserRole, 
    loading: isLoading 
  };
};
