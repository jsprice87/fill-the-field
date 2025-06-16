
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/utils/searchUtils';
import type { LeadStatus } from '@/types';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface AdvancedSearchState {
  searchTerm: string;
  selectedStatuses: LeadStatus[];
  dateRange: DateRange;
  currentSort: SortOption | undefined;
}

export const useAdvancedSearch = <T>(
  data: T[],
  searchFields: (keyof T)[],
  defaultSort?: SortOption
) => {
  const [searchState, setSearchState] = useState<AdvancedSearchState>({
    searchTerm: '',
    selectedStatuses: [],
    dateRange: { from: undefined, to: undefined },
    currentSort: defaultSort
  });

  // Debounced search term - now properly typed
  const debouncedSearchTerm = useDebounce(searchState.searchTerm, 300);

  // Search functions
  const updateSearchTerm = useCallback((term: string) => {
    setSearchState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const updateStatusFilter = useCallback((statuses: LeadStatus[]) => {
    setSearchState(prev => ({ ...prev, selectedStatuses: statuses }));
  }, []);

  const updateDateRange = useCallback((range: DateRange) => {
    setSearchState(prev => ({ ...prev, dateRange: range }));
  }, []);

  const updateSort = useCallback((sort: SortOption) => {
    setSearchState(prev => ({ ...prev, currentSort: sort }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchState({
      searchTerm: '',
      selectedStatuses: [],
      dateRange: { from: undefined, to: undefined },
      currentSort: defaultSort
    });
  }, [defaultSort]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchLower);
          }
          return false;
        })
      );
    }

    // Apply status filter
    if (searchState.selectedStatuses.length > 0) {
      filtered = filtered.filter(item => {
        const status = (item as any).status;
        return searchState.selectedStatuses.includes(status);
      });
    }

    // Apply date range filter
    if (searchState.dateRange.from || searchState.dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date((item as any).created_at);
        
        if (searchState.dateRange.from && itemDate < searchState.dateRange.from) {
          return false;
        }
        
        if (searchState.dateRange.to) {
          const endOfDay = new Date(searchState.dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (itemDate > endOfDay) {
            return false;
          }
        }
        
        return true;
      });
    }

    // Apply sorting
    if (searchState.currentSort) {
      const { key, direction } = searchState.currentSort;
      filtered.sort((a, b) => {
        const aValue = (a as any)[key];
        const bValue = (b as any)[key];
        
        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = aValue < bValue ? -1 : 1;
        }
        
        return direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, searchState, searchFields]);

  const hasActiveFilters = 
    debouncedSearchTerm.trim().length > 0 ||
    searchState.selectedStatuses.length > 0 ||
    searchState.dateRange.from ||
    searchState.dateRange.to;

  return {
    searchState,
    filteredData: filteredAndSortedData,
    hasActiveFilters,
    updateSearchTerm,
    updateStatusFilter,
    updateDateRange,
    updateSort,
    clearAllFilters
  };
};
