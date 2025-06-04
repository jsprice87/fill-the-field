
import { supabase } from '@/integrations/supabase/client';

export const setupLeadPolicies = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('setup-lead-policies', {
      method: 'POST'
    });
    
    if (error) {
      console.error('Error setting up lead policies:', error);
      return false;
    }
    
    console.log('Lead policies setup result:', data);
    return true;
  } catch (error) {
    console.error('Failed to setup lead policies:', error);
    return false;
  }
};
