
import React from 'react';
import { Button, Group } from '@mantine/core';
import { TableCell, TableRow } from '@/components/mantine';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';
import { ClassFormData } from '@/types/domain';

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
  const isAgeRangeValid = classData.minAge <= classData.maxAge;
  const isCapacityValid = classData.capacity > 0;

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
        <Group gap="xs">
          <Input
            type="number"
            min="3"
            max="18"
            value={classData.minAge}
            onChange={(e) => handleFieldChange('minAge', parseInt(e.target.value) || 3)}
            disabled={disabled}
            className={`w-16 ${!isAgeRangeValid ? 'border-red-500' : ''}`}
            placeholder="Min"
            title="Minimum age"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            min="3"
            max="18"
            value={classData.maxAge}
            onChange={(e) => handleFieldChange('maxAge', parseInt(e.target.value) || 12)}
            disabled={disabled}
            className={`w-16 ${!isAgeRangeValid ? 'border-red-500' : ''}`}
            placeholder="Max"
            title="Maximum age"
          />
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
