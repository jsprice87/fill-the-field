
import React from 'react';
import { Button, Group, TextInput, NumberInput } from '@mantine/core';
import { TableCell, TableRow } from '@/components/mantine';
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
        <TextInput
          placeholder="Enter class name *"
          value={classData.className}
          onChange={(e) => handleFieldChange('className', e.target.value)}
          disabled={disabled}
          error={!isClassNameValid && classData.className !== ''}
          required
          style={{ minWidth: '12rem' }}
        />
      </TableCell>

      <TableCell>
        <TextInput
          type="time"
          value={classData.startTime}
          onChange={(e) => handleFieldChange('startTime', e.target.value)}
          disabled={disabled}
          w={128}
        />
      </TableCell>

      <TableCell>
        <NumberInput
          min={15}
          max={120}
          step={15}
          value={classData.duration}
          onChange={(value) => handleFieldChange('duration', value || 60)}
          disabled={disabled}
          error={!isDurationValid}
          title="Duration must be between 15-120 minutes"
          w={96}
        />
      </TableCell>

      <TableCell>
        <TextInput
          type="time"
          value={classData.endTime}
          readOnly
          title="Auto-calculated based on start time + duration"
          w={128}
          styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)' } }}
        />
      </TableCell>

      <TableCell>
        <Group 
          gap="xs" 
          style={!isAgeRangeValid ? { 
            border: '1px solid var(--mantine-color-red-filled)', 
            borderRadius: 'var(--mantine-radius-sm)', 
            padding: 'var(--mantine-spacing-xs)' 
          } : {}}
        >
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
        <NumberInput
          min={1}
          max={50}
          value={classData.capacity}
          onChange={(value) => handleFieldChange('capacity', value || 12)}
          disabled={disabled}
          error={!isCapacityValid}
          w={80}
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
