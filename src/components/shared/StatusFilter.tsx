
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types';

interface StatusFilterProps {
  selectedStatuses: LeadStatus[];
  onStatusChange: (statuses: LeadStatus[]) => void;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'New', variant: 'default' },
  follow_up: { label: 'Follow Up', variant: 'secondary' },
  booked_upcoming: { label: 'Booked', variant: 'default' },
  booked_complete: { label: 'Complete', variant: 'default' },
  no_show: { label: 'No Show', variant: 'destructive' },
  closed_won: { label: 'Won', variant: 'default' },
  closed_lost: { label: 'Lost', variant: 'destructive' },
  canceled: { label: 'Canceled', variant: 'outline' }
};

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  onStatusChange,
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const allStatuses = Object.keys(statusConfig) as LeadStatus[];
  const hasActiveFilters = selectedStatuses.length > 0 && selectedStatuses.length < allStatuses.length;

  const toggleStatus = (status: LeadStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const selectAll = () => {
    onStatusChange(allStatuses);
  };

  const clearAll = () => {
    onStatusChange([]);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Status
            {hasActiveFilters && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter by Status</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs h-7"
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs h-7"
                >
                  None
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {allStatuses.map((status) => (
                <div key={status} className="flex items-center space-x-3">
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <Badge variant={statusConfig[status].variant} className="text-xs">
                      {statusConfig[status].label}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick clear button when filters are active */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default StatusFilter;
