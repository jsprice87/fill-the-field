
import { useEffect } from 'react';
import { useFranchiseeProfile } from './useFranchiseeProfile';
import { supabase } from '@/integrations/supabase/client';

export const useProfileValidation = () => {
  const { data: profile, isLoading, refetch, error } = useFranchiseeProfile();

  // Trigger the query only when user is authenticated
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          refetch();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthAndFetch();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Small delay to ensure the user record is fully created
        setTimeout(() => {
          refetch();
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [refetch]);

  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = [
      'contact_name',
      'email',
      'company_name'
    ];
    
    return requiredFields.every(field => 
      profile[field as keyof typeof profile] && 
      String(profile[field as keyof typeof profile]).trim() !== ''
    );
  };

  const getMissingFields = () => {
    if (!profile) return [];
    
    const requiredFields = [
      { key: 'contact_name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'company_name', label: 'Company Name' }
    ];
    
    return requiredFields.filter(field => 
      !profile[field.key as keyof typeof profile] || 
      String(profile[field.key as keyof typeof profile]).trim() === ''
    );
  };

  return {
    isProfileComplete: isProfileComplete(),
    missingFields: getMissingFields(),
    isLoading,
    profile,
    error
  };
};
