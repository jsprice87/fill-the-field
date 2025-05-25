
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDateSelection, AvailableDate } from '@/hooks/useDateSelection';

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
  const { availableDates, selectedDate, setSelectedDate, allowFutureBookings } = useDateSelection(classScheduleId);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const currentSelected = externalSelectedDate || selectedDate;
  const selectedDateObj = availableDates.find(d => d.date === currentSelected);
  const showWarning = selectedDateObj && !selectedDateObj.isNextAvailable && allowFutureBookings;

  const formatDate = (dateStr: string, dayName: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${dayName}, ${month} ${day}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-brand-blue" />
        <h4 className="font-poppins font-medium text-brand-navy">Select Class Date</h4>
      </div>

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

      {showWarning && (
        <Alert className="border-yellow-400 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 font-poppins text-sm">
            <strong>Future Date Selected:</strong> We can only reserve free-trial spots one week in advance. 
            If our classes fill with paying customers before your selected date, your free trial may be canceled.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DateSelector;
