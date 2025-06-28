import React, { useState } from 'react';
import { Button, TextInput, Popover, Badge, Group, Stack, Text } from '@mantine/core';
import { Calendar, X, Plus } from "lucide-react";

interface MultiDatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
  selectedDates,
  onDatesChange,
}) => {
  const [newDate, setNewDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addDate = () => {
    if (newDate && !selectedDates.includes(newDate)) {
      onDatesChange([...selectedDates, newDate]);
      setNewDate('');
    }
  };

  const removeDate = (dateToRemove: string) => {
    onDatesChange(selectedDates.filter(date => date !== dateToRemove));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Popover opened={isOpen} onChange={setIsOpen} position="bottom-start" withArrow>
      <Popover.Target>
        <Button
          variant="outline"
          justify="start"
          fullWidth
          leftSection={<Calendar size={16} />}
        >
          {selectedDates.length === 0 ? (
            <Text c="dimmed">Override dates</Text>
          ) : (
            <Text>{selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}</Text>
          )}
        </Button>
      </Popover.Target>
      <Popover.Dropdown p="md" w={320}>
        <Stack gap="md">
          <Group gap="sm">
            <TextInput
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              flex={1}
            />
            <Button
              size="sm"
              onClick={addDate}
              disabled={!newDate || selectedDates.includes(newDate)}
              leftSection={<Plus size={16} />}
            >
              Add
            </Button>
          </Group>

          {selectedDates.length > 0 && (
            <Stack gap="sm">
              <Text size="sm" fw={500}>Selected override dates:</Text>
              <Group gap="xs">
                {selectedDates.map((date) => (
                  <Badge
                    key={date}
                    variant="light"
                    rightSection={
                      <Button
                        size="compact-xs"
                        variant="transparent"
                        p={0}
                        onClick={() => removeDate(date)}
                        c="red"
                      >
                        <X size={12} />
                      </Button>
                    }
                  >
                    {formatDate(date)}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}

          <Text size="xs" c="dimmed">
            Override dates are when this class will be cancelled
          </Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default MultiDatePicker;
