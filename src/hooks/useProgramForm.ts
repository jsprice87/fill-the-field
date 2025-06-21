
import { useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';

interface ProgramData {
  locationId: string;
  daysOfWeek: number[];
  startDate: Date | null;
  endDate: Date | null;
}

interface ClassRowData {
  id: string;
  className: string;
  startTime: string;
  duration: number;
  endTime: string;
  minAge: number;
  maxAge: number;
  capacity: number;
}

const createDefaultClassRow = (existingRow?: ClassRowData): ClassRowData => {
  const baseData = existingRow || {
    startTime: '09:00',
    duration: 60,
    minAge: 5,
    maxAge: 12,
    capacity: 12,
  };

  const startTime = baseData.startTime;
  const endTime = dayjs(`2000-01-01 ${startTime}`)
    .add(baseData.duration, 'minute')
    .format('HH:mm');

  return {
    id: Math.random().toString(36).substr(2, 9),
    className: '',
    startTime: baseData.startTime,
    duration: baseData.duration,
    endTime,
    minAge: baseData.minAge,
    maxAge: baseData.maxAge,
    capacity: baseData.capacity,
  };
};

export const useProgramForm = () => {
  const [programData, setProgramData] = useState<ProgramData>({
    locationId: '',
    daysOfWeek: [],
    startDate: null,
    endDate: null,
  });

  const [classRows, setClassRows] = useState<ClassRowData[]>([
    createDefaultClassRow()
  ]);

  const isProgramValid = useMemo(() => {
    return (
      programData.locationId.trim() !== '' &&
      programData.daysOfWeek.length > 0
    );
  }, [programData]);

  const addClassRow = useCallback(() => {
    const lastRow = classRows[classRows.length - 1];
    const newRow = createDefaultClassRow(lastRow);
    setClassRows(prev => [...prev, newRow]);
  }, [classRows]);

  const removeClassRow = useCallback((id: string) => {
    setClassRows(prev => prev.filter(row => row.id !== id));
  }, []);

  const updateClassRow = useCallback((id: string, field: keyof ClassRowData, value: any) => {
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

  return {
    programData,
    setProgramData,
    classRows,
    setClassRows,
    isProgramValid,
    addClassRow,
    removeClassRow,
    updateClassRow,
  };
};
