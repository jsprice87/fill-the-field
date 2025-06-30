
import React from 'react';
import { Button, Card, Stack, Group, Text, Loader, Badge, Alert } from '@mantine/core';
import { Calendar, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useDateSelection } from '@/hooks/useDateSelection';
import { formatDateInTimezone } from '@/utils/timezoneUtils';
import { parseISO } from 'date-fns';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';

interface DateSelectorProps {
  classScheduleId: string;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  classScheduleId,
  onDateSelect,
  selectedDate: externalSelectedDate
}) => {
  const { data: settings } = useFranchiseeSettings();
  const timezone = settings?.timezone || 'America/New_York';
  
  const { 
    availableDates, 
    selectedDate, 
    setSelectedDate, 
    isLoading,
    allowFutureBookings
  } = useDateSelection(classScheduleId);

  // Auto-select if only one date available
  React.useEffect(() => {
    if (availableDates.length === 1 && !selectedDate && !externalSelectedDate) {
      const singleDate = availableDates[0].date;
      setSelectedDate(singleDate);
      onDateSelect(singleDate);
    }
  }, [availableDates, selectedDate, externalSelectedDate, setSelectedDate, onDateSelect]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const currentSelected = externalSelectedDate || selectedDate;
  const selectedDateObj = availableDates.find(d => d.date === currentSelected);
  const showWarning = selectedDateObj && !selectedDateObj.isNextAvailable && allowFutureBookings;

  const formatDate = (dateStr: string, dayName: string) => {
    try {
      const date = parseISO(dateStr + 'T00:00:00');
      const month = formatDateInTimezone(date, timezone, 'MMM');
      const day = formatDateInTimezone(date, timezone, 'd');
      return `${dayName}, ${month} ${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return `${dayName}, ${dateStr}`;
    }
  };

  if (isLoading) {
    return (
      <Stack spacing="md">
        <Group spacing="xs" mb="xs">
          <Calendar className="h-4 w-4 text-brand-blue" />
          <Text className="font-poppins font-medium text-brand-navy" size="md">Select Class Date</Text>
        </Group>
        <Stack spacing="xs">
          <Card className="h-12 bg-gray-200" />
          <Card className="h-12 bg-gray-200" />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing="md">
      <Group spacing="xs" mb="xs">
        <Calendar className="h-4 w-4 text-brand-blue" />
        <Text className="font-poppins font-medium text-brand-navy" size="md">Select Class Date</Text>
      </Group>

      {availableDates.length === 0 ? (
        <Alert 
          icon={<Info className="h-4 w-4" />}
          color="orange"
          variant="light"
          radius="md"
        >
          <Text className="text-orange-800 font-poppins" size="sm">
            No available dates found for this class.
          </Text>
        </Alert>
      ) : (
        <Stack spacing="xs">
          {availableDates.length === 1 && currentSelected && (
            <Alert 
              icon={<CheckCircle className="h-4 w-4" />}
              color="green"
              variant="light"
              radius="md"
            >
              <Text className="text-green-800 font-poppins" size="sm">
                <strong>Date Auto-Selected:</strong> Only one available date found and automatically selected.
              </Text>
            </Alert>
          )}
          {availableDates.map((dateOption) => (
            <Button
              key={dateOption.date}
              variant={currentSelected === dateOption.date ? "filled" : "outline"}
              onClick={() => handleDateSelect(dateOption.date)}
              className={`justify-start h-auto p-3 ${
                currentSelected === dateOption.date 
                  ? "bg-brand-blue hover:bg-brand-blue/90 text-white" 
                  : "hover:bg-blue-50"
              }`}
              size="lg"
              fullWidth
              styles={{
                inner: {
                  justifyContent: 'flex-start'
                }
              }}
            >
              <Group spacing="sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Group spacing="sm">
                  <Text className="font-poppins font-medium">
                    {formatDate(dateOption.date, dateOption.dayName)}
                  </Text>
                  {dateOption.isNextAvailable && (
                    <Badge color="green" size="sm" variant="light">
                      Next Available
                    </Badge>
                  )}
                </Group>
                {currentSelected === dateOption.date && (
                  <CheckCircle 
                    className="h-5 w-5 text-white" 
                    style={{ flexShrink: 0 }}
                  />
                )}
              </Group>
            </Button>
          ))}
        </Stack>
      )}

      {showWarning && (
        <Alert 
          icon={<AlertTriangle className="h-4 w-4" />}
          color="yellow"
          variant="light"
          radius="md"
        >
          <Text className="text-yellow-800 font-poppins" size="sm">
            <strong>Future Date Selected:</strong> We can only reserve free-trial spots one week in advance. 
            If our classes fill with paying customers before your selected date, your free trial may be canceled.
          </Text>
        </Alert>
      )}

      {/* Information about booking restrictions */}
      {allowFutureBookings && availableDates.length > 1 && (
        <Card className="bg-blue-50" padding="sm" radius="md">
          <Text className="text-blue-700 font-poppins" size="xs">
            💡 You can book up to several weeks in advance. The earliest available date is recommended for the best experience.
          </Text>
        </Card>
      )}
    </Stack>
  );
};

export default DateSelector;
