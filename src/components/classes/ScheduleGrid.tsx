
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ScheduleRow from './ScheduleRow';

interface ScheduleRowType {
  className: string;
  dayOfWeek: number;
  duration: number;
  timeStart: string;
  timeEnd: string;
  dateStart: string;
  dateEnd: string;
  overrideDates: string[];
  minAge: number;
  maxAge: number;
  capacity: number;
}

interface ScheduleGridProps {
  rows: ScheduleRowType[];
  onRowChange: (index: number, field: keyof ScheduleRowType, value: any) => void;
  onRemoveRow: (index: number) => void;
  globalDayOfWeek: number;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  rows,
  onRowChange,
  onRemoveRow,
  globalDayOfWeek,
}) => {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No schedules added yet. Click "Add Row" to get started.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 min-w-48">Class Name</TableHead>
            <TableHead className="w-24 min-w-24">Day</TableHead>
            <TableHead className="w-32 min-w-32">Duration (min)</TableHead>
            <TableHead className="w-32 min-w-32">Time Start</TableHead>
            <TableHead className="w-32 min-w-32">Time End</TableHead>
            <TableHead className="w-32 min-w-32">Date Start</TableHead>
            <TableHead className="w-32 min-w-32">Date End</TableHead>
            <TableHead className="w-40 min-w-40">Override Dates</TableHead>
            <TableHead className="w-40 min-w-40">Age Range</TableHead>
            <TableHead className="w-24 min-w-24">Capacity</TableHead>
            <TableHead className="w-16 min-w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <ScheduleRow
              key={index}
              row={row}
              index={index}
              onRowChange={onRowChange}
              onRemoveRow={onRemoveRow}
              globalDayOfWeek={globalDayOfWeek}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScheduleGrid;
