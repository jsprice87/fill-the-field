
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import { 
  getCurrentDateInTimezone, 
  addDaysInTimezone, 
  getDayOfWeekInTimezone, 
  getDateStringInTimezone,
  DEFAULT_TIMEZONE
} from '@/utils/timezoneUtils';
import { parseISO } from 'date-fns';

export interface ValidatedDate {
  date: string;
  dayName: string;
  isNextAvailable: boolean;
}

interface ClassScheduleData {
  day_of_week: number;
  date_start?: string;
  date_end?: string;
  schedule_exceptions?: Array<{
    exception_date: string;
    is_cancelled: boolean;
  }>;
}

export const useEnhancedDateSelection = (classScheduleId?: string) => {
  const { data: settings } = useFranchiseeSettings();
  const [availableDates, setAvailableDates] = useState<ValidatedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowFutureBookings = settings?.allow_future_bookings === 'true';
  const maxBookingDaysAhead = parseInt(settings?.max_booking_days_ahead || '7');
  const timezone = settings?.timezone || DEFAULT_TIMEZONE;

  useEffect(() => {
    if (classScheduleId) {
      loadValidDates();
    }
  }, [classScheduleId, allowFutureBookings, maxBookingDaysAhead, timezone]);

  const loadValidDates = async () => {
    if (!classScheduleId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch class schedule with exceptions
      const { data: schedule, error: scheduleError } = await supabase
        .from('class_schedules')
        .select(`
          day_of_week,
          date_start,
          date_end,
          schedule_exceptions(
            exception_date,
            is_cancelled
          )
        `)
        .eq('id', classScheduleId)
        .single();

      if (scheduleError || !schedule) {
        console.error('Error loading schedule:', scheduleError);
        setError('Failed to load class schedule');
        return;
      }

      const validDates = generateValidDates(schedule as ClassScheduleData);
      setAvailableDates(validDates);
      
      // Auto-select the first available date
      if (validDates.length > 0) {
        setSelectedDate(validDates[0].date);
      }
    } catch (error) {
      console.error('Error loading valid dates:', error);
      setError('Failed to load available dates');
    } finally {
      setIsLoading(false);
    }
  };

  const generateValidDates = (schedule: ClassScheduleData): ValidatedDate[] => {
    const dates: ValidatedDate[] = [];
    const today = getCurrentDateInTimezone(timezone);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get override dates (cancelled dates) for this class
    const cancelledDates = new Set(
      schedule.schedule_exceptions
        ?.filter(exception => exception.is_cancelled)
        .map(exception => exception.exception_date) || []
    );

    // Parse class schedule dates in the correct timezone
    const classStartDate = schedule.date_start ? parseISO(schedule.date_start + 'T00:00:00') : null;
    const classEndDate = schedule.date_end ? parseISO(schedule.date_end + 'T23:59:59') : null;
    
    // Calculate the maximum date we can book
    const maxBookingDate = addDaysInTimezone(today, maxBookingDaysAhead, timezone);

    // Find the next occurrence of the class day
    let currentDate = new Date(today);
    
    // Find the next occurrence of the target day of week
    let daysUntilClass = (schedule.day_of_week - getDayOfWeekInTimezone(currentDate, timezone) + 7) % 7;
    
    // If it's the same day but after 6 PM in the local timezone, start from next week
    const currentHour = currentDate.getHours();
    if (daysUntilClass === 0 && currentHour >= 18) {
      daysUntilClass = 7;
    }
    
    currentDate = addDaysInTimezone(currentDate, daysUntilClass, timezone);

    let foundNextAvailable = false;
    let weeksChecked = 0;
    const maxWeeksToCheck = Math.ceil(maxBookingDaysAhead / 7) + 4; // Buffer for edge cases

    while (weeksChecked < maxWeeksToCheck && dates.length < 10) {
      const dateStr = getDateStringInTimezone(currentDate, timezone);
      
      // Verify the day of week is correct (double-check our calculation)
      const dayOfWeek = getDayOfWeekInTimezone(currentDate, timezone);
      if (dayOfWeek !== schedule.day_of_week) {
        console.error(`Day of week mismatch: expected ${schedule.day_of_week}, got ${dayOfWeek} for date ${dateStr}`);
        // Skip this date and try the next week
        currentDate = addDaysInTimezone(currentDate, 7, timezone);
        weeksChecked++;
        continue;
      }
      
      // Check all validation rules
      const isValidDate = isDateValid(currentDate, {
        classStartDate,
        classEndDate,
        cancelledDates,
        maxBookingDate,
        allowFutureBookings,
        isFirstDate: !foundNextAvailable,
        timezone
      });

      if (isValidDate) {
        dates.push({
          date: dateStr,
          dayName: dayNames[schedule.day_of_week],
          isNextAvailable: !foundNextAvailable
        });
        
        if (!foundNextAvailable) {
          foundNextAvailable = true;
        }

        // If future bookings are not allowed, only get the next available date
        if (!allowFutureBookings && foundNextAvailable) {
          break;
        }
      }

      // Move to next week
      currentDate = addDaysInTimezone(currentDate, 7, timezone);
      weeksChecked++;
    }

    return dates;
  };

  const isDateValid = (
    date: Date,
    options: {
      classStartDate: Date | null;
      classEndDate: Date | null;
      cancelledDates: Set<string>;
      maxBookingDate: Date;
      allowFutureBookings: boolean;
      isFirstDate: boolean;
      timezone: string;
    }
  ): boolean => {
    const dateStr = getDateStringInTimezone(date, options.timezone);
    const today = getCurrentDateInTimezone(options.timezone);

    // Check if date is in the past (but allow today)
    if (date < today && !isSameDayInTimezone(date, today, options.timezone)) {
      return false;
    }

    // Check if date is within class schedule range
    if (options.classStartDate && date < options.classStartDate) {
      return false;
    }
    
    if (options.classEndDate && date > options.classEndDate) {
      return false;
    }

    // Check if date is cancelled/override
    if (options.cancelledDates.has(dateStr)) {
      return false;
    }

    // For the first date (next available), always allow regardless of future booking settings
    if (options.isFirstDate) {
      return true;
    }

    // Check future booking restrictions
    if (!options.allowFutureBookings) {
      return false;
    }

    // Check if date is within max booking days ahead
    if (date > options.maxBookingDate) {
      return false;
    }

    return true;
  };

  const isSameDayInTimezone = (date1: Date, date2: Date, timezone: string): boolean => {
    const date1Str = getDateStringInTimezone(date1, timezone);
    const date2Str = getDateStringInTimezone(date2, timezone);
    return date1Str === date2Str;
  };

  const getValidationMessage = (): string | null => {
    if (error) return error;
    
    if (availableDates.length === 0 && !isLoading) {
      if (!allowFutureBookings) {
        return "No classes available at this time. Please check back later.";
      } else {
        return `No classes available in the next ${maxBookingDaysAhead} days. Please contact us directly or check back later.`;
      }
    }
    
    return null;
  };

  return {
    availableDates,
    selectedDate,
    setSelectedDate,
    isLoading,
    error,
    allowFutureBookings,
    maxBookingDaysAhead,
    validationMessage: getValidationMessage(),
    timezone
  };
};
