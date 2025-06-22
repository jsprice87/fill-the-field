
import { useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { ProgramFormData, ClassFormData } from '@/types/domain';

const createDefaultClassRow = (existingRow?: ClassFormData): ClassFormData => {
  const baseData = existingRow || {
    startTime: '09:00',
    duration: 60,
    minAgeYears: 5,
    minAgeMonths: 0,
    maxAgeYears: 12,
    maxAgeMonths: 0,
    capacity: 12,
  };

  const startTime = baseData.startTime;
  const endTime = dayjs(`2000-01-01 ${startTime}`)
    .add(baseData.duration, 'minute')
    .format('HH:mm');

  return {
    id: Math.random().toString(36).substr(2, 9),
    className: existingRow?.className ? `${existingRow.className} (copy)` : '',
    startTime: baseData.startTime,
    duration: baseData.duration,
    endTime,
    minAgeYears: baseData.minAgeYears,
    minAgeMonths: baseData.minAgeMonths,
    maxAgeYears: baseData.maxAgeYears,
    maxAgeMonths: baseData.maxAgeMonths,
    capacity: baseData.capacity,
  };
};

export const useProgramForm = () => {
  const [programData, setProgramData] = useState<ProgramFormData>({
    programName: '',
    locationId: '',
    daysOfWeek: [],
    startDate: null,
    endDate: null,
    overrideDates: [],
  });

  const [classRows, setClassRows] = useState<ClassFormData[]>([
    createDefaultClassRow()
  ]);

  const isProgramValid = useMemo(() => {
    return (
      programData.locationId.trim() !== '' &&
      programData.daysOfWeek.length > 0
    );
  }, [programData]);

  const areClassesValid = useMemo(() => {
    return classRows.every(row => {
      const isClassNameValid = row.className.trim() !== '';
      const isDurationValid = row.duration >= 15 && row.duration <= 120;
      const isCapacityValid = row.capacity > 0;
      
      // Compare min and max ages (years first, then months)
      const isAgeRangeValid = 
        row.minAgeYears < row.maxAgeYears || 
        (row.minAgeYears === row.maxAgeYears && row.minAgeMonths <= row.maxAgeMonths);
      
      return isClassNameValid && isDurationValid && isCapacityValid && isAgeRangeValid;
    });
  }, [classRows]);

  const areOverrideDatesValid = useMemo(() => {
    if (!programData.startDate || !programData.endDate) return true;
    
    return programData.overrideDates.every(date => 
      date >= programData.startDate! && date <= programData.endDate!
    );
  }, [programData.overrideDates, programData.startDate, programData.endDate]);

  const addClassRow = useCallback(() => {
    const lastRow = classRows[classRows.length - 1];
    const newRow = createDefaultClassRow(lastRow);
    // Copy the class name with "(copy)" suffix
    if (lastRow.className.trim()) {
      newRow.className = `${lastRow.className} (copy)`;
    }
    setClassRows(prev => [...prev, newRow]);
  }, [classRows]);

  const removeClassRow = useCallback((id: string) => {
    setClassRows(prev => prev.filter(row => row.id !== id));
  }, []);

  const updateClassRow = useCallback((id: string, field: keyof ClassFormData, value: any) => {
    setClassRows(prev => prev.map(row => {
      if (row.id !== id) return row;

      const updatedRow = { ...row, [field]: value };

      // Auto-calculate end time when start time or duration changes
      if (field === 'startTime' || field === 'duration') {
        const startTime = field === 'startTime' ? value : row.startTime;
        const duration = field === 'duration' ? value : row.duration;
        
        if (startTime && duration) {
          updatedRow.endTime = dayjs(`2000-01-01 ${startTime}`)
            .add(duration, 'minute')
            .format('HH:mm');
        }
      }

      return updatedRow;
    }));
  }, []);

  const addOverrideDate = useCallback((date: Date) => {
    setProgramData(prev => {
      // Prevent duplicates
      const existingDates = prev.overrideDates.map(d => d.toDateString());
      if (existingDates.includes(date.toDateString())) {
        return prev;
      }
      
      return {
        ...prev,
        overrideDates: [...prev.overrideDates, date].sort((a, b) => a.getTime() - b.getTime())
      };
    });
  }, []);

  const removeOverrideDate = useCallback((date: Date) => {
    setProgramData(prev => ({
      ...prev,
      overrideDates: prev.overrideDates.filter(d => d.toDateString() !== date.toDateString())
    }));
  }, []);

  return {
    programData,
    setProgramData,
    classRows,
    setClassRows,
    isProgramValid,
    areClassesValid,
    areOverrideDatesValid,
    addClassRow,
    removeClassRow,
    updateClassRow,
    addOverrideDate,
    removeOverrideDate,
  };
};
