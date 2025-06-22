
import React, { useState } from 'react';
import { Card, Stack, Group, Checkbox, Grid, Button } from '@mantine/core';
import { Calendar, MapPin, X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DateInput } from '@/components/mantine/DateInput';
import LocationSelector from './LocationSelector';
import { ProgramFormData } from '@/types/domain';

interface ProgramDetailsCardProps {
  programData: ProgramFormData;
  onProgramDataChange: (data: ProgramFormData) => void;
  franchiseeId?: string;
  onAddOverrideDate: (date: Date) => void;
  onRemoveOverrideDate: (date: Date) => void;
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

const ProgramDetailsCard: React.FC<ProgramDetailsCardProps> = ({
  programData,
  onProgramDataChange,
  franchiseeId,
  onAddOverrideDate,
  onRemoveOverrideDate,
}) => {
  const [newOverrideDate, setNewOverrideDate] = useState<Date | null>(null);

  const handleDayToggle = (dayValue: number, checked: boolean) => {
    const newDays = checked
      ? [...programData.daysOfWeek, dayValue]
      : programData.daysOfWeek.filter(day => day !== dayValue);
    
    onProgramDataChange({
      ...programData,
      daysOfWeek: newDays.sort()
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    onProgramDataChange({
      ...programData,
      startDate: date
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onProgramDataChange({
      ...programData,
      endDate: date
    });
  };

  const handleAddOverrideDate = () => {
    if (newOverrideDate) {
      onAddOverrideDate(newOverrideDate);
      setNewOverrideDate(null);
    }
  };

  return (
    <Card withBorder>
      <Card.Section className="flex items-center gap-2 p-4 border-b">
        <MapPin className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Program Details</h3>
        <span className="text-sm text-gray-500">(Shared by all classes)</span>
      </Card.Section>
      
      <Card.Section className="p-4">
        <Stack gap="lg">
          <LocationSelector
            franchiseeId={franchiseeId || null}
            selectedLocationId={programData.locationId}
            onLocationChange={(locationId) => 
              onProgramDataChange({ ...programData, locationId })
            }
          />

          <div className="space-y-2">
            <Label className="text-base font-medium">
              Days of Week <span className="text-red-500">*</span>
            </Label>
            <Group gap="md">
              {DAYS_OF_WEEK.map((day) => (
                <Checkbox
                  key={day.value}
                  label={day.label}
                  checked={programData.daysOfWeek.includes(day.value)}
                  onChange={(event) => handleDayToggle(day.value, event.currentTarget.checked)}
                />
              ))}
            </Group>
          </div>

          <Grid>
            <Grid.Col span={6}>
              <div className="space-y-2">
                <Label className="text-base font-medium">Program Start Date</Label>
                <DateInput
                  value={programData.startDate}
                  onChange={handleStartDateChange}
                  placeholder="Select start date"
                  leftSection={<Calendar className="h-4 w-4" />}
                />
              </div>
            </Grid.Col>
            <Grid.Col span={6}>
              <div className="space-y-2">
                <Label className="text-base font-medium">Program End Date</Label>
                <DateInput
                  value={programData.endDate}
                  onChange={handleEndDateChange}
                  placeholder="Select end date"
                  leftSection={<Calendar className="h-4 w-4" />}
                  minDate={programData.startDate || undefined}
                />
              </div>
            </Grid.Col>
          </Grid>

          <div className="space-y-3">
            <Label className="text-base font-medium">Override Dates</Label>
            <p className="text-sm text-gray-600">
              Dates when classes will be cancelled (holidays, breaks, etc.)
            </p>
            
            <div className="flex gap-2">
              <DateInput
                value={newOverrideDate}
                onChange={setNewOverrideDate}
                placeholder="Select override date"
                leftSection={<Calendar className="h-4 w-4" />}
                minDate={programData.startDate || undefined}
                maxDate={programData.endDate || undefined}
                className="flex-1"
              />
              <Button
                onClick={handleAddOverrideDate}
                disabled={!newOverrideDate}
                leftSection={<Plus className="h-4 w-4" />}
                variant="outline"
              >
                Add
              </Button>
            </div>

            {programData.overrideDates.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Scheduled Override Dates:</div>
                <div className="flex flex-wrap gap-2">
                  {programData.overrideDates.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      {date.toLocaleDateString()}
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onRemoveOverrideDate(date)}
                        className="h-4 w-4 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default ProgramDetailsCard;
