import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@mantine/core';
import { Calendar, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-brand-blue" />
          <h4 className="font-poppins font-medium text-brand-navy">Select Class Date</h4>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-brand-blue" />
        <h4 className="font-poppins font-medium text-brand-navy">Select Class Date</h4>
      </div>

      {availableDates.length === 0 ? (
        <Alert className="border-orange-400 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 font-poppins text-sm">
            No available dates found for this class.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-2">
          {availableDates.map((dateOption) => (
            <Button
              key={dateOption.date}
              variant={currentSelected === dateOption.date ? "default" : "outline"}
              onClick={() => handleDateSelect(dateOption.date)}
              className={`justify-start h-auto p-3 ${
                currentSelected === dateOption.date 
                  ? "bg-brand-blue hover:bg-brand-blue/90 text-white" 
                  : "hover:bg-blue-50"
              }`}
            >
              <div className="text-left">
                <div className="font-poppins font-medium">
                  {formatDate(dateOption.date, dateOption.dayName)}
                  {dateOption.isNextAvailable && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Next Available
                    </span>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {showWarning && (
        <Alert className="border-yellow-400 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 font-poppins text-sm">
            <strong>Future Date Selected:</strong> We can only reserve free-trial spots one week in advance. 
            If our classes fill with paying customers before your selected date, your free trial may be canceled.
          </AlertDescription>
        </Alert>
      )}

      {/* Information about booking restrictions */}
      {allowFutureBookings && availableDates.length > 1 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700 font-poppins">
            💡 You can book up to several weeks in advance. The earliest available date is recommended for the best experience.
          </p>
        </div>
      )}
    </div>
  );
};

export default DateSelector;
