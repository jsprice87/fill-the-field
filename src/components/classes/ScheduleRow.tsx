
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import MultiDatePicker from './MultiDatePicker';
import AgeRangeInput from './AgeRangeInput';
import type { ScheduleRow as ScheduleRowType } from '@/pages/portal/Classes';

interface ScheduleRowProps {
  row: ScheduleRowType;
  index: number;
  onRowChange: (index: number, field: keyof ScheduleRowType, value: any) => void;
  onRemoveRow: (index: number) => void;
  globalDayOfWeek: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  row,
  index,
  onRowChange,
  onRemoveRow,
  globalDayOfWeek,
}) => {
  return (
    <TableRow>
      <TableCell className="w-48">
        <Input
          type="text"
          placeholder="Enter class name"
          value={row.className}
          onChange={(e) => onRowChange(index, 'className', e.target.value)}
          className="w-full min-w-44"
          required
        />
      </TableCell>

      <TableCell className="w-24">
        <Select
          value={row.dayOfWeek.toString()}
          onValueChange={(value) => onRowChange(index, 'dayOfWeek', parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((day) => (
              <SelectItem key={day.value} value={day.value.toString()}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="w-32">
        <Input
          type="number"
          min="15"
          max="180"
          step="15"
          value={row.duration}
          onChange={(e) => onRowChange(index, 'duration', parseInt(e.target.value) || 60)}
          className="w-full"
        />
      </TableCell>

      <TableCell className="w-32">
        <Input
          type="time"
          value={row.timeStart}
          onChange={(e) => onRowChange(index, 'timeStart', e.target.value)}
          className="w-full"
        />
      </TableCell>

      <TableCell className="w-32">
        <Input
          type="time"
          value={row.timeEnd}
          className="w-full bg-gray-50"
          readOnly
          title="Auto-calculated based on start time + duration"
        />
      </TableCell>

      <TableCell className="w-32">
        <Input
          type="date"
          value={row.dateStart}
          onChange={(e) => onRowChange(index, 'dateStart', e.target.value)}
          className="w-full"
        />
      </TableCell>

      <TableCell className="w-32">
        <Input
          type="date"
          value={row.dateEnd}
          onChange={(e) => onRowChange(index, 'dateEnd', e.target.value)}
          className="w-full"
        />
      </TableCell>

      <TableCell className="w-40">
        <MultiDatePicker
          selectedDates={row.overrideDates}
          onDatesChange={(dates) => onRowChange(index, 'overrideDates', dates)}
        />
      </TableCell>

      <TableCell className="w-40">
        <AgeRangeInput
          minAge={row.minAge}
          maxAge={row.maxAge}
          onMinAgeChange={(value) => onRowChange(index, 'minAge', value)}
          onMaxAgeChange={(value) => onRowChange(index, 'maxAge', value)}
        />
      </TableCell>

      <TableCell className="w-24">
        <Input
          type="number"
          min="1"
          max="50"
          value={row.capacity}
          onChange={(e) => onRowChange(index, 'capacity', parseInt(e.target.value) || 1)}
          className="w-full"
        />
      </TableCell>

      <TableCell className="w-16">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveRow(index)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ScheduleRow;
