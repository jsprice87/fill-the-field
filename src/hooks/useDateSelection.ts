
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import { 
  getCurrentDateInTimezone, 
  addDaysInTimezone, 
  isSameDayInTimezone,
  getDayOfWeekInTimezone,
  getDateStringInTimezone,
  DEFAULT_TIMEZONE
} from '@/utils/timezoneUtils';
import { parseISO } from 'date-fns';

export interface AvailableDate {
  date: string;
  dayName: string;
  isNextAvailable: boolean;
}

export const useDateSelection = (classScheduleId?: string) => {
  const { data: settings } = useFranchiseeSettings();
  const timezone = settings?.timezone || DEFAULT_TIMEZONE;
  
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const allowFutureBookings = settings?.allow_future_bookings === 'true';
  const maxBookingDaysAhead = parseInt(settings?.max_booking_days_ahead || '7');

  useEffect(() => {
    if (classScheduleId) {
      loadAvailableDates();
    }
  }, [classScheduleId, allowFutureBookings, maxBookingDaysAhead, timezone]);

  const loadAvailableDates = async () => {
    if (!classScheduleId) return;

    setIsLoading(true);
    try {
      const { data: schedule, error } = await supabase
        .from('class_schedules')
        .select('day_of_week, date_start, date_end')
        .eq('id', classScheduleId)
        .single();

      if (error || !schedule) {
        console.error('Error loading schedule:', error);
        return;
      }

      const dates = generateAvailableDates(
        schedule.day_of_week, 
        allowFutureBookings, 
        maxBookingDaysAhead,
        schedule.date_start,
        schedule.date_end
      );
      setAvailableDates(dates);
      
      // Auto-select the next available date
      if (dates.length > 0) {
        setSelectedDate(dates[0].date);
      }
    } catch (error) {
      console.error('Error loading available dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAvailableDates = (
    dayOfWeek: number, 
    allowFuture: boolean, 
    maxDays: number,
    dateStart?: string,
    dateEnd?: string
  ): AvailableDate[] => {
    const dates: AvailableDate[] = [];
    const currentDate = getCurrentDateInTimezone(timezone);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Parse schedule bounds if they exist
    const scheduleStartDate = dateStart ? parseISO(dateStart + 'T00:00:00') : null;
    const scheduleEndDate = dateEnd ? parseISO(dateEnd + 'T23:59:59') : null;
    
    // Find the next occurrence of the class day
    let nextDate = new Date(currentDate);
    const daysUntilClass = (dayOfWeek - getDayOfWeekInTimezone(currentDate, timezone) + 7) % 7;
    
    if (daysUntilClass === 0 && currentDate.getHours() >= 18) {
      // If it's the same day but after 6 PM, move to next week
      nextDate = addDaysInTimezone(currentDate, 7, timezone);
    } else {
      nextDate = addDaysInTimezone(currentDate, daysUntilClass, timezone);
    }

    // Check if the next date is within schedule bounds
    if (scheduleStartDate && nextDate < scheduleStartDate) {
      // If next occurrence is before schedule start, use schedule start date
      const startDayOfWeek = getDayOfWeekInTimezone(scheduleStartDate, timezone);
      if (startDayOfWeek === dayOfWeek) {
        nextDate = new Date(scheduleStartDate);
      } else {
        // Find the first occurrence of the class day on or after schedule start
        const daysFromStartToClass = (dayOfWeek - startDayOfWeek + 7) % 7;
        nextDate = addDaysInTimezone(scheduleStartDate, daysFromStartToClass, timezone);
      }
    }

    // Add dates within bounds
    let dateToCheck = new Date(nextDate);
    let isFirst = true;
    
    for (let i = 0; i < (allowFuture ? Math.floor(maxDays / 7) + 1 : 1); i++) {
      // Check if date is within schedule bounds
      if (scheduleStartDate && dateToCheck < scheduleStartDate) {
        dateToCheck = addDaysInTimezone(dateToCheck, 7, timezone);
        continue;
      }
      
      if (scheduleEndDate && dateToCheck > scheduleEndDate) {
        break;
      }
      
      // Check if date is not too far in the past
      if (dateToCheck >= currentDate || isSameDayInTimezone(dateToCheck, currentDate, timezone)) {
        dates.push({
          date: getDateStringInTimezone(dateToCheck, timezone),
          dayName: dayNames[dayOfWeek],
          isNextAvailable: isFirst
        });
        isFirst = false;
      }
      
      if (!allowFuture) break;
      dateToCheck = addDaysInTimezone(dateToCheck, 7, timezone);
    }

    return dates;
  };

  return {
    availableDates,
    selectedDate,
    setSelectedDate,
    isLoading,
    allowFutureBookings,
    maxBookingDaysAhead
  };
};
