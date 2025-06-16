
import React, { useState } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SearchFilter {
  key: string;
  label: string;
  value: string;
}

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface AdvancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  filters?: SearchFilter[];
  onFilterChange?: (filters: SearchFilter[]) => void;
  sortOptions?: SortOption[];
  currentSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  className?: string;
}

const AdvancedSearchInput: React.FC<AdvancedSearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  filters = [],
  onFilterChange,
  sortOptions = [],
  currentSort,
  onSortChange,
  className
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const removeFilter = (filterToRemove: SearchFilter) => {
    const newFilters = filters.filter(f => f.key !== filterToRemove.key);
    onFilterChange?.(newFilters);
  };

  const hasActiveFilters = filters.length > 0;
  const hasSearch = value.trim().length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input Row */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-10 h-11"
          />
          {hasSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        {onFilterChange && (
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {filters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Filters</h4>
                <div className="text-sm text-muted-foreground">
                  Additional filter options would be implemented here based on the specific data type.
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFilterChange([])}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Sort Button */}
        {sortOptions.length > 0 && onSortChange && (
          <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={currentSort ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                {currentSort?.direction === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <Button
                    key={`${option.key}-${option.direction}`}
                    variant={
                      currentSort?.key === option.key && currentSort?.direction === option.direction
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() => {
                      onSortChange(option);
                      setIsSortOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    {option.direction === 'asc' ? (
                      <SortAsc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortDesc className="h-4 w-4 mr-2" />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-xs font-medium">{filter.label}:</span>
              <span className="text-xs">{filter.value}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter)}
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchInput;
