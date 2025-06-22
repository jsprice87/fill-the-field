
import React from 'react';
import { Button, Group } from '@mantine/core';
import { TableCell, TableRow } from '@/components/mantine';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';
import { ClassFormData } from '@/types/domain';
import AgeYearsMonthsInput from './AgeYearsMonthsInput';

interface ClassRowProps {
  classData: ClassFormData;
  onUpdate: (id: string, field: keyof ClassFormData, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  disabled?: boolean;
}

const ClassRow: React.FC<ClassRowProps> = ({
  classData,
  onUpdate,
  onRemove,
  canRemove,
  disabled = false,
}) => {
  const handleFieldChange = (field: keyof ClassFormData, value: any) => {
    onUpdate(classData.id, field, value);
  };

  // Validation helpers
  const isClassNameValid = classData.className.trim() !== '';
  const isDurationValid = classData.duration >= 15 && classData.duration <= 120;
  const isCapacityValid = classData.capacity > 0;
  
  const isAgeRangeValid = 
    classData.minAgeYears < classData.maxAgeYears || 
    (classData.minAgeYears === classData.maxAgeYears && classData.minAgeMonths <= classData.maxAgeMonths);

  return (
    <TableRow>
      <TableCell>
        <Input
          type="text"
          placeholder="Enter class name *"
          value={classData.className}
          onChange={(e) => handleFieldChange('className', e.target.value)}
          disabled={disabled}
          className={`min-w-48 ${!isClassNameValid && classData.className !== '' ? 'border-red-500' : ''}`}
          required
        />
      </TableCell>

      <TableCell>
        <Input
          type="time"
          value={classData.startTime}
          onChange={(e) => handleFieldChange('startTime', e.target.value)}
          disabled={disabled}
          className="w-32"
        />
      </TableCell>

      <TableCell>
        <Input
          type="number"
          min="15"
          max="120"
          step="15"
          value={classData.duration}
          onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 60)}
          disabled={disabled}
          className={`w-24 ${!isDurationValid ? 'border-red-500' : ''}`}
          title="Duration must be between 15-120 minutes"
        />
      </TableCell>

      <TableCell>
        <Input
          type="time"
          value={classData.endTime}
          className="w-32 bg-gray-50"
          readOnly
          title="Auto-calculated based on start time + duration"
        />
      </TableCell>

      <TableCell>
        <Group gap="xs" className={!isAgeRangeValid ? 'border border-red-500 rounded p-2' : ''}>
          <div>
            <div className="text-xs text-gray-500 mb-1">Min</div>
            <AgeYearsMonthsInput
              years={classData.minAgeYears}
              months={classData.minAgeMonths}
              onYearsChange={(value) => handleFieldChange('minAgeYears', value)}
              onMonthsChange={(value) => handleFieldChange('minAgeMonths', value)}
              placeholder="Min age"
              disabled={disabled}
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Max</div>
            <AgeYearsMonthsInput
              years={classData.maxAgeYears}
              months={classData.maxAgeMonths}
              onYearsChange={(value) => handleFieldChange('maxAgeYears', value)}
              onMonthsChange={(value) => handleFieldChange('maxAgeMonths', value)}
              placeholder="Max age"
              disabled={disabled}
            />
          </div>
        </Group>
      </TableCell>

      <TableCell>
        <Input
          type="number"
          min="1"
          max="50"
          value={classData.capacity}
          onChange={(e) => handleFieldChange('capacity', parseInt(e.target.value) || 12)}
          disabled={disabled}
          className={`w-20 ${!isCapacityValid ? 'border-red-500' : ''}`}
        />
      </TableCell>

      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(classData.id)}
          disabled={disabled || !canRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ClassRow;
