import { supabase } from '@/integrations/supabase/client';

export const getEffectiveUserId = async (): Promise<string | null> => {
  // Check if we're in impersonation mode (using localStorage as per useImpersonation hook)
  try {
    const impersonationSession = localStorage.getItem('impersonation-session');
    
    if (impersonationSession) {
      const session = JSON.parse(impersonationSession);
      if (session && session.targetUser && session.targetUser.id) {
        return session.targetUser.id;
      }
    }
  } catch (error) {
    console.error('Error parsing impersonation session:', error);
  }
  
  // Default to current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

export const getEffectiveFranchiseeId = async (): Promise<string | null> => {
  const userId = await getEffectiveUserId();
  if (!userId) return null;
  
  // Get the franchisee ID for this user
  const { data, error } = await supabase
    .from('franchisees')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting franchisee ID:', error);
    return null;
  }
  
  return data?.id || null;
};

export const isImpersonating = (): boolean => {
  try {
    const impersonationSession = localStorage.getItem('impersonation-session');
    return !!impersonationSession;
  } catch {
    return false;
  }
};