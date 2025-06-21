
import React from 'react';
import { Table, TextInput, NumberInput, Button } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { Trash } from 'lucide-react';
import { ClassRowData } from '@/hooks/useProgramForm';

interface ClassRowProps {
  data: ClassRowData;
  index: number;
  onUpdate: (index: number, data: Partial<ClassRowData>) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
}

const ClassRow: React.FC<ClassRowProps> = ({
  data,
  index,
  onUpdate,
  onDelete,
  canDelete
}) => {
  const handleUpdate = (field: keyof ClassRowData, value: any) => {
    const updates: Partial<ClassRowData> = { [field]: value };
    
    // Auto-calculate end time when start time or duration changes
    if (field === 'startTime' || field === 'durationMinutes') {
      const startTime = field === 'startTime' ? value : data.startTime;
      const duration = field === 'durationMinutes' ? value : data.durationMinutes;
      
      if (startTime && duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + duration * 60000);
        const endTime = endDate.toTimeString().slice(0, 5);
        updates.endTime = endTime;
      }
    }
    
    onUpdate(index, updates);
  };

  return (
    <Table.Tr>
      <Table.Td>
        <TextInput
          value={data.className}
          onChange={(e) => handleUpdate('className', e.target.value)}
          placeholder="e.g., Beginner Soccer"
          required
        />
      </Table.Td>
      <Table.Td>
        <TimeInput
          value={data.startTime}
          onChange={(value) => handleUpdate('startTime', value)}
          required
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={data.durationMinutes}
          onChange={(value) => handleUpdate('durationMinutes', value)}
          min={15}
          max={180}
          step={15}
          required
        />
      </Table.Td>
      <Table.Td>
        <TextInput
          value={data.endTime}
          readOnly
          placeholder="Auto-calculated"
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={data.minAge}
          onChange={(value) => handleUpdate('minAge', value)}
          min={2}
          max={18}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={data.maxAge}
          onChange={(value) => handleUpdate('maxAge', value)}
          min={2}
          max={18}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={data.maxCapacity}
          onChange={(value) => handleUpdate('maxCapacity', value)}
          min={1}
          max={50}
          required
        />
      </Table.Td>
      <Table.Td>
        <Button
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => onDelete(index)}
          disabled={!canDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

export default ClassRow;
