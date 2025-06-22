
import dayjs from 'dayjs';

export function ageFitsClass(birthDate: Date, minAge?: number, maxAge?: number): boolean {
  if (!minAge && !maxAge) return true;
  
  const ageYears = dayjs().diff(dayjs(birthDate), 'year');
  
  if (minAge && ageYears < minAge) return false;
  if (maxAge && ageYears > maxAge) return false;
  
  return true;
}

export function getAgeInYears(birthDate: Date): number {
  return dayjs().diff(dayjs(birthDate), 'year');
}
