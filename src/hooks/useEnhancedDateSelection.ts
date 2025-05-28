
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeSettings } from './useFranchiseeSettings';
import { 
  getDayOfWeekInTimezone, 
  getCurrentDateInTimezone, 
  addDaysInTimezone, 
  isSameDayInTimezone,
  DEFAULT_TIMEZONE,
  getDateStringInTimezone
} from '@/utils/timezoneUtils';

export interface ClassSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  date_start?: string;
  date_end?: string;
  classes: {
    name: string;
    min_age?: number;
    max_age?: number;
  };
}

export interface ScheduleException {
  exception_date: string;
  is_cancelled: boolean;
}

export interface BookingRestrictions {
  advance_booking_days?: number;
  max_advance_booking_days?: number;
  same_day_booking_enabled?: boolean;
  restrict_to_schedule_days?: boolean;
}

export const useEnhancedDateSelection = (
  schedules: ClassSchedule[] = [],
  participantAge?: number,
  franchiseeId?: string
) => {
  const { data: settings } = useFranchiseeSettings();
  const timezone = settings?.timezone || DEFAULT_TIMEZONE;
  
  const [scheduleExceptions, setScheduleExceptions] = useState<ScheduleException[]>([]);
  const [bookingRestrictions, setBookingRestrictions] = useState<BookingRestrictions>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load schedule exceptions and booking restrictions
  useEffect(() => {
    const loadData = async () => {
      if (!franchiseeId || schedules.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        // Load schedule exceptions
        const scheduleIds = schedules.map(s => s.id);
        const { data: exceptions } = await supabase
          .from('schedule_exceptions')
          .select('exception_date, is_cancelled')
          .in('class_schedule_id', scheduleIds);

        if (exceptions) {
          setScheduleExceptions(exceptions);
        }

        // Load booking restrictions from franchisee settings
        const { data: restrictionSettings } = await supabase
          .from('franchisee_settings')
          .select('setting_key, setting_value')
          .eq('franchisee_id', franchiseeId)
          .in('setting_key', [
            'advance_booking_days',
            'max_advance_booking_days', 
            'same_day_booking_enabled',
            'restrict_to_schedule_days'
          ]);

        if (restrictionSettings) {
          const restrictions: BookingRestrictions = {};
          restrictionSettings.forEach(setting => {
            if (setting.setting_key === 'advance_booking_days' || setting.setting_key === 'max_advance_booking_days') {
              restrictions[setting.setting_key] = parseInt(setting.setting_value || '0');
            } else if (setting.setting_key === 'same_day_booking_enabled' || setting.setting_key === 'restrict_to_schedule_days') {
              restrictions[setting.setting_key] = setting.setting_value === 'true';
            }
          });
          setBookingRestrictions(restrictions);
        }
      } catch (error) {
        console.error('Error loading date selection data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [schedules, franchiseeId]);

  // Filter schedules by participant age
  const ageFilteredSchedules = useMemo(() => {
    if (!participantAge) return schedules;
    
    return schedules.filter(schedule => {
      const minAge = schedule.classes.min_age;
      const maxAge = schedule.classes.max_age;
      
      if (minAge && participantAge < minAge) return false;
      if (maxAge && participantAge > maxAge) return false;
      
      return true;
    });
  }, [schedules, participantAge]);

  // Get valid days of week from filtered schedules
  const validDaysOfWeek = useMemo(() => {
    return [...new Set(ageFilteredSchedules.map(schedule => schedule.day_of_week))];
  }, [ageFilteredSchedules]);

  // Check if a date is valid for booking
  const isDateValid = useMemo(() => {
    return (date: Date): boolean => {
      const currentDate = getCurrentDateInTimezone(timezone);
      const dateString = getDateStringInTimezone(date, timezone);
      
      // Check if date is in the past
      if (isSameDayInTimezone(date, currentDate, timezone)) {
        // Same day booking check
        if (!bookingRestrictions.same_day_booking_enabled) {
          return false;
        }
      } else if (date < currentDate) {
        return false;
      }

      // Check advance booking restrictions
      if (bookingRestrictions.advance_booking_days) {
        const minBookingDate = addDaysInTimezone(currentDate, bookingRestrictions.advance_booking_days, timezone);
        if (date < minBookingDate) {
          return false;
        }
      }

      // Check max advance booking restrictions
      if (bookingRestrictions.max_advance_booking_days) {
        const maxBookingDate = addDaysInTimezone(currentDate, bookingRestrictions.max_advance_booking_days, timezone);
        if (date > maxBookingDate) {
          return false;
        }
      }

      // Check if we should restrict to schedule days only
      if (bookingRestrictions.restrict_to_schedule_days) {
        const dayOfWeek = getDayOfWeekInTimezone(date, timezone);
        if (!validDaysOfWeek.includes(dayOfWeek)) {
          return false;
        }
      }

      // Check for cancelled exceptions
      const isCancelled = scheduleExceptions.some(exception => 
        exception.exception_date === dateString && exception.is_cancelled
      );
      
      if (isCancelled) {
        return false;
      }

      // Check if date falls within any schedule's active period
      const hasActiveSchedule = ageFilteredSchedules.some(schedule => {
        const dayOfWeek = getDayOfWeekInTimezone(date, timezone);
        
        if (schedule.day_of_week !== dayOfWeek) {
          return false;
        }

        // Check date range if specified
        if (schedule.date_start) {
          if (date < new Date(schedule.date_start)) {
            return false;
          }
        }
        
        if (schedule.date_end) {
          if (date > new Date(schedule.date_end)) {
            return false;
          }
        }

        return true;
      });

      return hasActiveSchedule;
    };
  }, [ageFilteredSchedules, scheduleExceptions, bookingRestrictions, validDaysOfWeek, timezone]);

  // Generate available dates for the next 60 days
  const availableDates = useMemo(() => {
    if (isLoading || ageFilteredSchedules.length === 0) {
      return [];
    }

    const dates: Date[] = [];
    const currentDate = getCurrentDateInTimezone(timezone);
    const endDate = addDaysInTimezone(currentDate, 60, timezone);

    let checkDate = new Date(currentDate);
    while (checkDate <= endDate) {
      if (isDateValid(checkDate)) {
        dates.push(new Date(checkDate));
      }
      checkDate = addDaysInTimezone(checkDate, 1, timezone);
    }

    return dates;
  }, [ageFilteredSchedules, isDateValid, isLoading, timezone]);

  return {
    availableDates,
    isDateValid,
    isLoading,
    validDaysOfWeek,
    ageFilteredSchedules,
    bookingRestrictions,
    timezone
  };
};
