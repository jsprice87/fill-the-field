
import React from 'react';
import { Card, Stack, Button, Group, Text, Table } from '@mantine/core';
import { Plus } from 'lucide-react';
import ClassRow from './ClassRow';
import { ClassRowData } from '@/hooks/useProgramForm';

interface EditableClassesTableProps {
  classes: ClassRowData[];
  onAddClass: () => void;
  onUpdateClass: (index: number, data: Partial<ClassRowData>) => void;
  onDeleteClass: (index: number) => void;
  onCreateProgram: () => Promise<void>;
  isValidProgram: boolean;
  isCreating: boolean;
}

const EditableClassesTable: React.FC<EditableClassesTableProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onCreateProgram,
  isValidProgram,
  isCreating
}) => {
  const canAddClass = isValidProgram && classes.length > 0 && classes[classes.length - 1].className.trim() !== '';
  const canCreateProgram = isValidProgram && classes.length > 0 && classes.every(c => c.className.trim() !== '');

  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <div>
            <Text fw={500} size="lg">Classes</Text>
            <Text size="sm" c="dimmed">
              Define the individual classes for this program
            </Text>
          </div>
          <Button
            leftSection={<Plus className="h-4 w-4" />}
            onClick={onAddClass}
            disabled={!canAddClass}
            variant="light"
          >
            Add Class
          </Button>
        </Group>
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Class Name</Table.Th>
              <Table.Th>Start Time</Table.Th>
              <Table.Th>Duration (min)</Table.Th>
              <Table.Th>End Time</Table.Th>
              <Table.Th>Min Age</Table.Th>
              <Table.Th>Max Age</Table.Th>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {classes.map((classData, index) => (
              <ClassRow
                key={index}
                data={classData}
                index={index}
                onUpdate={onUpdateClass}
                onDelete={onDeleteClass}
                canDelete={classes.length > 1}
              />
            ))}
          </Table.Tbody>
        </Table>

        <Group justify="flex-end" mt="lg">
          <Button
            onClick={onCreateProgram}
            disabled={!canCreateProgram}
            loading={isCreating}
            size="md"
          >
            Create Program & Save All Classes
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default EditableClassesTable;
