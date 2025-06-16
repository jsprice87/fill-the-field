
import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  label?: string;
  className?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  label = "Date Range",
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const hasActiveRange = dateRange.from || dateRange.to;
  
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return null;
    
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    
    if (dateRange.from) {
      return `From ${format(dateRange.from, 'MMM d, yyyy')}`;
    }
    
    if (dateRange.to) {
      return `Until ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    
    return null;
  };

  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const presetRanges = [
    {
      label: 'Today',
      range: { from: new Date(), to: new Date() }
    },
    {
      label: 'Last 7 days',
      range: { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      label: 'Last 30 days',
      range: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      label: 'This month',
      range: { 
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
        to: new Date() 
      }
    }
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveRange ? "default" : "outline"}
            size="sm"
            className="justify-start text-left font-normal"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {label}
            {hasActiveRange && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            {/* Preset ranges */}
            <div className="border-r p-3 space-y-2 w-48">
              <h4 className="font-medium text-sm mb-3">Quick Select</h4>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDateRangeChange(preset.range);
                    setIsOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  {preset.label}
                </Button>
              ))}
              {hasActiveRange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearDateRange();
                    setIsOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <CalendarComponent
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range) {
                    onDateRangeChange({
                      from: range.from,
                      to: range.to
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter display */}
      {hasActiveRange && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {formatDateRange()}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateRange}
              className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
