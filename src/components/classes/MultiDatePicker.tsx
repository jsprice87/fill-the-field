
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar, X, Plus } from "lucide-react";

interface MultiDatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
  selectedDates,
  onDatesChange,
}) => {
  const [newDate, setNewDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addDate = () => {
    if (newDate && !selectedDates.includes(newDate)) {
      onDatesChange([...selectedDates, newDate]);
      setNewDate('');
    }
  };

  const removeDate = (dateToRemove: string) => {
    onDatesChange(selectedDates.filter(date => date !== dateToRemove));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {selectedDates.length === 0 ? (
            <span className="text-muted-foreground">Override dates</span>
          ) : (
            <span>{selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={addDate}
              disabled={!newDate || selectedDates.includes(newDate)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {selectedDates.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected override dates:</p>
              <div className="flex flex-wrap gap-1">
                {selectedDates.map((date) => (
                  <Badge key={date} variant="secondary" className="flex items-center gap-1">
                    {formatDate(date)}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => removeDate(date)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Override dates are when this class will be cancelled
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiDatePicker;
