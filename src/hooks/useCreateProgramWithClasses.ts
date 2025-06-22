
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProgramFormData, ClassFormData } from '@/types/domain';
import { toDtoClassSchedule } from '@/utils/mappers/class';
import dayjs from 'dayjs';

interface CreateProgramWithClassesData {
  programData: ProgramFormData;
  classRows: ClassFormData[];
  franchiseeId: string;
}

// Helper function to safely convert dates to ISO string
const toISODate = (date: Date | null | string | undefined): string | null => {
  if (!date) return null;
  if (typeof date === 'string') return dayjs(date).format('YYYY-MM-DD');
  return date.toISOString().split('T')[0];
};

export const useCreateProgramWithClasses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programData, classRows, franchiseeId }: CreateProgramWithClassesData) => {
      const createdClasses = [];
      const createdSchedules = [];

      try {
        // Create each class with merged program + class data
        for (const classRow of classRows) {
          if (!classRow.className.trim()) {
            throw new Error("All classes must have a name");
          }

          // Convert age years/months to total months for storage
          const minAgeMonths = classRow.minAgeYears * 12 + classRow.minAgeMonths;
          const maxAgeMonths = classRow.maxAgeYears * 12 + classRow.maxAgeMonths;

          // Create class record
          const { data: classData, error: classError } = await supabase
            .from('classes')
            .insert([
              {
                name: classRow.className,
                class_name: classRow.className,
                description: `${classRow.className} program`,
                duration_minutes: classRow.duration,
                max_capacity: classRow.capacity,
                min_age: Math.floor(minAgeMonths / 12), // Store as years for compatibility
                max_age: Math.floor(maxAgeMonths / 12), // Store as years for compatibility
                location_id: programData.locationId,
                is_active: true,
              },
            ])
            .select()
            .single();

          if (classError) {
            console.error("Error creating class:", classError);
            throw new Error(`Failed to create class "${classRow.className}": ${classError.message}`);
          }

          createdClasses.push(classData);

          // Create class schedule for each selected day
          for (const dayOfWeek of programData.daysOfWeek) {
            const scheduleInput = toDtoClassSchedule({
              classId: classData.id,
              startTime: classRow.startTime,
              endTime: classRow.endTime,
              dateStart: programData.startDate,
              dateEnd: programData.endDate,
              dayOfWeek,
              currentBookings: 0,
              isActive: true,
            });

            const { data: scheduleData, error: scheduleError } = await supabase
              .from('class_schedules')
              .insert([scheduleInput])
              .select()
              .single();

            if (scheduleError) {
              console.error("Error creating class schedule:", scheduleError);
              throw new Error(`Failed to create schedule for "${classRow.className}" on day ${dayOfWeek}: ${scheduleError.message}`);
            }

            createdSchedules.push(scheduleData);
          }

          // Create schedule exceptions for override dates
          if (programData.overrideDates.length > 0) {
            const exceptionInserts = programData.overrideDates.map(date => ({
              class_schedule_id: createdSchedules[createdSchedules.length - programData.daysOfWeek.length]?.id,
              exception_date: toISODate(date),
              is_cancelled: true,
            }));

            const { error: exceptionError } = await supabase
              .from('schedule_exceptions')
              .insert(exceptionInserts);

            if (exceptionError) {
              console.error("Error creating schedule exceptions:", exceptionError);
              throw new Error(`Failed to create override dates for "${classRow.className}": ${exceptionError.message}`);
            }
          }
        }

        return { 
          createdClasses, 
          createdSchedules,
          success: true 
        };
      } catch (error) {
        console.error("Program creation failed, rolling back:", error);
        
        // Rollback: delete any created schedules first (due to foreign key constraints)
        if (createdSchedules.length > 0) {
          const scheduleIds = createdSchedules.map(schedule => schedule.id);
          
          // Delete schedule exceptions first
          await supabase
            .from('schedule_exceptions')
            .delete()
            .in('class_schedule_id', scheduleIds);
          
          // Then delete schedules
          await supabase
            .from('class_schedules')
            .delete()
            .in('id', scheduleIds);
        }
        
        // Then delete classes
        if (createdClasses.length > 0) {
          const classIds = createdClasses.map(cls => cls.id);
          await supabase
            .from('classes')
            .delete()
            .in('id', classIds);
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-schedules'] });
    },
  });
};
