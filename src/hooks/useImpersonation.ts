import { useState, useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImpersonationTarget {
  id: string;
  name: string;
  email: string;
  company?: string;
}

interface ImpersonationSession {
  adminUserId: string;
  adminUserEmail: string;
  targetUser: ImpersonationTarget;
  startedAt: string;
}

export const useImpersonation = () => {
  const [impersonationSession, setImpersonationSession] = useLocalStorage<ImpersonationSession | null>({
    key: 'impersonation-session',
    defaultValue: null
  });
  
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    setIsImpersonating(!!impersonationSession);
  }, [impersonationSession]);

  const startImpersonation = async (targetUser: ImpersonationTarget) => {
    try {
      // Get current admin user
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      // Verify admin has permission to impersonate
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminUser.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error('Insufficient permissions for impersonation');
      }

      // Create impersonation session
      const session: ImpersonationSession = {
        adminUserId: adminUser.id,
        adminUserEmail: adminUser.email!,
        targetUser,
        startedAt: new Date().toISOString()
      };

      // Log the impersonation action
      await logImpersonationAction('start', session);

      setImpersonationSession(session);
      toast.success(`Started impersonating ${targetUser.name}`);
      
      return session;
    } catch (error) {
      console.error('Error starting impersonation:', error);
      toast.error(`Failed to start impersonation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const exitImpersonation = async () => {
    if (!impersonationSession) return;

    try {
      // Log the exit action
      await logImpersonationAction('end', impersonationSession);

      const targetName = impersonationSession.targetUser.name;
      setImpersonationSession(null);
      
      toast.success(`Stopped impersonating ${targetName}`);
      
      // Redirect to admin portal
      window.location.href = '/admin/user-management';
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      toast.error('Failed to log impersonation exit');
      // Still exit impersonation even if logging fails
      setImpersonationSession(null);
      // Still redirect even if logging fails
      window.location.href = '/admin/user-management';
    }
  };

  const logImpersonationAction = async (action: 'start' | 'end', session: ImpersonationSession) => {
    try {
      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_user_id: session.adminUserId,
          action: `impersonation_${action}`,
          target_user_id: session.targetUser.id,
          details: {
            target_user_email: session.targetUser.email,
            target_user_name: session.targetUser.name,
            target_company: session.targetUser.company,
            session_started_at: session.startedAt,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error logging impersonation action:', error);
      // Don't throw here - impersonation should work even if logging fails
    }
  };

  const getImpersonatedUserId = () => {
    return impersonationSession?.targetUser.id || null;
  };

  const getImpersonationContext = () => {
    if (!impersonationSession) return null;
    
    return {
      isImpersonating: true,
      adminUser: {
        id: impersonationSession.adminUserId,
        email: impersonationSession.adminUserEmail
      },
      targetUser: impersonationSession.targetUser,
      startedAt: impersonationSession.startedAt
    };
  };

  return {
    isImpersonating,
    impersonationSession,
    startImpersonation,
    exitImpersonation,
    getImpersonatedUserId,
    getImpersonationContext
  };
};