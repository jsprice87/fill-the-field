
import React from 'react';
import { Card, Stack, Group, Checkbox, Grid } from '@mantine/core';
import { Calendar, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DateInput } from '@/components/mantine/DateInput';
import LocationSelector from './LocationSelector';
import { ProgramFormData } from '@/types/domain';

interface ProgramDetailsCardProps {
  programData: ProgramFormData;
  onProgramDataChange: (data: ProgramFormData) => void;
  franchiseeId?: string;
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
}) => {
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
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default ProgramDetailsCard;
