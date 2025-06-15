
import React from 'react';
import { MapPin } from 'lucide-react';

interface DateTimeCellProps {
  selectedDate: string;
  classTime: string;
  locationName?: string;
  className?: string;
}

const DateTimeCell: React.FC<DateTimeCellProps> = ({ 
  selectedDate, 
  classTime, 
  locationName, 
  className 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{formatDate(selectedDate)}</div>
      <div className="text-xs text-gray-600">{classTime}</div>
      <div className="md:hidden text-xs text-gray-600 mt-1">
        <div className="flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {locationName}
        </div>
        <div className="lg:hidden mt-1">{className}</div>
      </div>
    </div>
  );
};

export default DateTimeCell;
