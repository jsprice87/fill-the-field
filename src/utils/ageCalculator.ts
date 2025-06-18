
export const calculateAge = (birthDate: string | Date): number => {
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  return Math.floor((Date.now() - birth.getTime()) / 31_557_600_000);
};

export const calculateAgeFromDate = (birthDate: Date): number => {
  return Math.floor((Date.now() - birthDate.getTime()) / 31_557_600_000);
};

export const isAgeInRange = (age: number, minAge?: number, maxAge?: number): boolean => {
  if (minAge && age < minAge) return false;
  if (maxAge && age > maxAge) return false;
  return true;
};
