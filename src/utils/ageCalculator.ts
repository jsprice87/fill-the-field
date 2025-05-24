
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const isAgeInRange = (age: number, minAge?: number, maxAge?: number): boolean => {
  if (minAge && age < minAge) return false;
  if (maxAge && age > maxAge) return false;
  return true;
};
