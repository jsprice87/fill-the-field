
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProgramFormData, ClassFormData } from '@/types/domain';
import { toDtoClassSchedule } from '@/utils/mappers/class';

interface CreateProgramWithClassesData {
  programData: ProgramFormData;
  classRows: ClassFormData[];
  franchiseeId: string;
}

export const useCreateProgramWithClasses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programData, classRows, franchiseeId }: CreateProgramWithClassesData) => {
      const createdClasses = [];
      let hasErrors = false;

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
            hasErrors = true;
            throw new Error(`Failed to create class: ${classRow.className}`);
          }

          // Create class schedule for each selected day
          const schedulePromises = programData.daysOfWeek.map(async (dayOfWeek) => {
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

            const { error: scheduleError } = await supabase
              .from('class_schedules')
              .insert([scheduleInput]);

            if (scheduleError) {
              console.error("Error creating class schedule:", scheduleError);
              throw new Error(`Failed to create schedule for ${classRow.className}`);
            }
          });

          await Promise.allSettled(schedulePromises);
          const failedSchedules = (await Promise.allSettled(schedulePromises))
            .filter(result => result.status === 'rejected');

          if (failedSchedules.length > 0) {
            hasErrors = true;
            throw new Error(`Failed to create some schedules for ${classRow.className}`);
          }

          createdClasses.push(classData);
        }

        return { createdClasses, success: true };
      } catch (error) {
        // Rollback: delete any created classes
        if (createdClasses.length > 0) {
          const classIds = createdClasses.map(cls => cls.id);
          
          // Delete schedules first (due to foreign key constraints)
          await supabase
            .from('class_schedules')
            .delete()
            .in('class_id', classIds);
          
          // Then delete classes
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
