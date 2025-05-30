
import { useFranchiseeProfile } from './useFranchiseeProfile';

export const useProfileValidation = () => {
  const { data: profile, isLoading } = useFranchiseeProfile();

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
    profile
  };
};
