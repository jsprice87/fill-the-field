
import React from 'react';
import { Card, Table, Button, Stack } from '@mantine/core';
import { TableHeader, TableBody, TableRow, TableHead } from '@/components/mantine';
import { BookOpen, Plus } from 'lucide-react';
import ClassRow from './ClassRow';
import { ClassFormData } from '@/types/domain';

interface EditableClassesTableProps {
  classRows: ClassFormData[];
  onUpdateRow: (id: string, field: keyof ClassFormData, value: any) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
  disabled?: boolean;
}

const EditableClassesTable: React.FC<EditableClassesTableProps> = ({
  classRows,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
  disabled = false,
}) => {
  if (classRows.length === 0) {
    return (
      <Card withBorder>
        <Card.Section className="flex items-center gap-2 p-4 border-b">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Classes</h3>
        </Card.Section>
        <Card.Section className="p-8">
          <div className="text-center text-gray-500">
            Fill in the program details above to start adding classes.
          </div>
        </Card.Section>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Card.Section className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Classes</h3>
          <span className="text-sm text-gray-500">({classRows.length} class{classRows.length !== 1 ? 'es' : ''})</span>
        </div>
      </Card.Section>
      
      <Card.Section className="p-4">
        <Stack gap="md">
          <div className="overflow-x-auto">
            <Table.ScrollContainer minWidth={800}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Age Range</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classRows.map((row) => (
                    <ClassRow
                      key={row.id}
                      classData={row}
                      onUpdate={onUpdateRow}
                      onRemove={onRemoveRow}
                      canRemove={classRows.length > 1}
                      disabled={disabled}
                    />
                  ))}
                </TableBody>
              </Table>
            </Table.ScrollContainer>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRow}
              disabled={disabled}
              leftSection={<Plus className="h-4 w-4" />}
            >
              Add Class
            </Button>
          </div>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default EditableClassesTable;
