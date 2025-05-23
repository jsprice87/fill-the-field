
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GlobalDayPickerProps {
  selectedDay: number;
  onDayChange: (day: number) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const GlobalDayPicker: React.FC<GlobalDayPickerProps> = ({
  selectedDay,
  onDayChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="global-day-picker" className="text-base font-medium">
        Default Day of Week
      </Label>
      <Select
        value={selectedDay.toString()}
        onValueChange={(value) => onDayChange(parseInt(value))}
      >
        <SelectTrigger id="global-day-picker" className="w-64">
          <SelectValue placeholder="Select day of week" />
        </SelectTrigger>
        <SelectContent>
          {DAYS_OF_WEEK.map((day) => (
            <SelectItem key={day.value} value={day.value.toString()}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        This day will be pre-filled for new rows (can be changed per row)
      </p>
    </div>
  );
};

export default GlobalDayPicker;
