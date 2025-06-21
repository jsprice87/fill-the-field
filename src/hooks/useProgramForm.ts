
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { supabase } from '@/integrations/supabase/client';
import { ProgramData } from '@/components/classes/ProgramDetailsCard';
import { useFranchiseeData } from './useFranchiseeData';

export interface ClassRowData {
  className: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  minAge: number | '';
  maxAge: number | '';
  maxCapacity: number | '';
}

const createEmptyClassRow = (): ClassRowData => ({
  className: '',
  startTime: '10:00',
  durationMinutes: 60,
  endTime: '11:00',
  minAge: 3,
  maxAge: 8,
  maxCapacity: 12,
});

export const useProgramForm = () => {
  const navigate = useNavigate();
  const { data: franchiseeData } = useFranchiseeData();
  
  const [programData, setProgramData] = useState<ProgramData>({
    locationId: '',
    daysOfWeek: [],
    dateStart: null,
    dateEnd: null,
    overrideDates: [],
  });

  const [classRows, setClassRows] = useState<ClassRowData[]>([createEmptyClassRow()]);
  const [isCreating, setIsCreating] = useState(false);

  const isValidProgram = programData.locationId !== '' && programData.daysOfWeek.length > 0;

  const addClassRow = useCallback(() => {
    const lastRow = classRows[classRows.length - 1];
    const newRow = {
      ...lastRow,
      className: '', // Always clear the class name for new rows
    };
    setClassRows(prev => [...prev, newRow]);
  }, [classRows]);

  const updateClassRow = useCallback((index: number, updates: Partial<ClassRowData>) => {
    setClassRows(prev => prev.map((row, i) => i === index ? { ...row, ...updates } : row));
  }, []);

  const deleteClassRow = useCallback((index: number) => {
    setClassRows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const createProgram = useCallback(async () => {
    if (!franchiseeData?.id) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Franchisee data not available'
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const promises = classRows.map(async (classRow) => {
        // Create the class first
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .insert({
            name: classRow.className,
            class_name: classRow.className,
            description: '',
            location_id: programData.locationId,
            duration_minutes: classRow.durationMinutes,
            min_age: classRow.minAge || null,
            max_age: classRow.maxAge || null,
            max_capacity: classRow.maxCapacity || 12,
            is_active: true,
          })
          .select()
          .single();

        if (classError) throw classError;

        // Create schedules for each selected day
        const schedulePromises = programData.daysOfWeek.map(async (dayOfWeek) => {
          const { error: scheduleError } = await supabase
            .from('class_schedules')
            .insert({
              class_id: classData.id,
              start_time: classRow.startTime,
              end_time: classRow.endTime,
              day_of_week: dayOfWeek,
              date_start: programData.dateStart?.toISOString().split('T')[0] || null,
              date_end: programData.dateEnd?.toISOString().split('T')[0] || null,
              current_bookings: 0,
              is_active: true,
            });

          if (scheduleError) throw scheduleError;
        });

        await Promise.all(schedulePromises);

        // Create override date exceptions if any
        if (programData.overrideDates.length > 0) {
          const exceptionPromises = programData.overrideDates.map(async (date) => {
            const { error: exceptionError } = await supabase
              .from('schedule_exceptions')
              .insert({
                class_schedule_id: classData.id, // This might need adjustment based on your schema
                exception_date: date,
                is_cancelled: true,
              });

            if (exceptionError) throw exceptionError;
          });

          await Promise.all(exceptionPromises);
        }

        return classData;
      });

      await Promise.all(promises);

      showNotification({
        color: 'green',
        title: 'Success',
        message: `Program created with ${classRows.length} classes`
      });

      navigate('../classes');
    } catch (error: any) {
      console.error('Error creating program:', error);
      showNotification({
        color: 'red',
        title: 'Error',
        message: error.message || 'Failed to create program'
      });
    } finally {
      setIsCreating(false);
    }
  }, [programData, classRows, franchiseeData?.id, navigate]);

  return {
    programData,
    setProgramData,
    classRows,
    addClassRow,
    updateClassRow,
    deleteClassRow,
    isValidProgram,
    createProgram,
    isCreating,
  };
};
