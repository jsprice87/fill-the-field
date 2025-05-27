
import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'America/New_York';

export const formatDateInTimezone = (date: Date | string, timezone: string = DEFAULT_TIMEZONE, formatStr: string = 'yyyy-MM-dd') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
};

export const formatTimeInTimezone = (date: Date | string, timezone: string = DEFAULT_TIMEZONE, formatStr: string = 'h:mm a') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
};

export const getDayOfWeekInTimezone = (date: Date | string, timezone: string = DEFAULT_TIMEZONE): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, timezone);
  return zonedDate.getDay();
};

export const createDateInTimezone = (dateString: string, timezone: string = DEFAULT_TIMEZONE): Date => {
  // Parse the date string as if it's in the specified timezone
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return fromZonedTime(localDate, timezone);
};

export const getCurrentDateInTimezone = (timezone: string = DEFAULT_TIMEZONE): Date => {
  return toZonedTime(new Date(), timezone);
};

export const addDaysInTimezone = (date: Date, days: number, timezone: string = DEFAULT_TIMEZONE): Date => {
  const zonedDate = toZonedTime(date, timezone);
  zonedDate.setDate(zonedDate.getDate() + days);
  return fromZonedTime(zonedDate, timezone);
};

export const isSameDayInTimezone = (date1: Date | string, date2: Date | string, timezone: string = DEFAULT_TIMEZONE): boolean => {
  const formatStr = 'yyyy-MM-dd';
  const date1Str = formatDateInTimezone(date1, timezone, formatStr);
  const date2Str = formatDateInTimezone(date2, timezone, formatStr);
  return date1Str === date2Str;
};

export const getDateStringInTimezone = (date: Date | string, timezone: string = DEFAULT_TIMEZONE): string => {
  return formatDateInTimezone(date, timezone, 'yyyy-MM-dd');
};
