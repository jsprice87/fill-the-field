
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';

export interface AvailableDate {
  date: string;
  dayName: string;
  isNextAvailable: boolean;
}

export const useDateSelection = (classScheduleId?: string) => {
  const { data: settings } = useFranchiseeSettings();
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const allowFutureBookings = settings?.allow_future_bookings === 'true';
  const maxBookingDaysAhead = parseInt(settings?.max_booking_days_ahead || '7');

  useEffect(() => {
    if (classScheduleId) {
      loadAvailableDates();
    }
  }, [classScheduleId, allowFutureBookings, maxBookingDaysAhead]);

  const loadAvailableDates = async () => {
    if (!classScheduleId) return;

    setIsLoading(true);
    try {
      const { data: schedule, error } = await supabase
        .from('class_schedules')
        .select('day_of_week')
        .eq('id', classScheduleId)
        .single();

      if (error || !schedule) {
        console.error('Error loading schedule:', error);
        return;
      }

      const dates = generateAvailableDates(schedule.day_of_week, allowFutureBookings, maxBookingDaysAhead);
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

  const generateAvailableDates = (dayOfWeek: number, allowFuture: boolean, maxDays: number): AvailableDate[] => {
    const dates: AvailableDate[] = [];
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Find the next occurrence of the class day
    let nextDate = new Date(today);
    const daysUntilClass = (dayOfWeek - today.getDay() + 7) % 7;
    if (daysUntilClass === 0 && today.getHours() >= 18) {
      // If it's the same day but after 6 PM, move to next week
      nextDate.setDate(today.getDate() + 7);
    } else {
      nextDate.setDate(today.getDate() + daysUntilClass);
    }

    // Add the next available date
    dates.push({
      date: nextDate.toISOString().split('T')[0],
      dayName: dayNames[dayOfWeek],
      isNextAvailable: true
    });

    // Add future dates if allowed
    if (allowFuture) {
      for (let i = 1; i <= Math.floor(maxDays / 7); i++) {
        const futureDate = new Date(nextDate);
        futureDate.setDate(nextDate.getDate() + (i * 7));
        
        dates.push({
          date: futureDate.toISOString().split('T')[0],
          dayName: dayNames[dayOfWeek],
          isNextAvailable: false
        });
      }
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
