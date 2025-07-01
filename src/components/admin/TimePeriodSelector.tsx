import React from 'react';
import { Select, Group, DateInput } from '@mantine/core';
import { DashboardFilters } from '@/hooks/useAdminDashboard';

interface TimePeriodSelectorProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  filters,
  onFiltersChange,
}) => {
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  const handleTimeRangeChange = (value: string | null) => {
    if (!value) return;
    
    onFiltersChange({
      ...filters,
      timeRange: value as DashboardFilters['timeRange'],
      // Clear custom dates when switching away from custom
      ...(value !== 'custom' && { startDate: undefined, endDate: undefined }),
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      startDate: date?.toISOString().split('T')[0] || undefined,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      endDate: date?.toISOString().split('T')[0] || undefined,
    });
  };

  return (
    <Group gap="md" align="flex-end">
      <Select
        label="Time Period"
        value={filters.timeRange}
        onChange={handleTimeRangeChange}
        data={timeRangeOptions}
        w={200}
      />
      
      {filters.timeRange === 'custom' && (
        <>
          <DateInput
            label="Start Date"
            value={filters.startDate ? new Date(filters.startDate) : null}
            onChange={handleStartDateChange}
            placeholder="Select start date"
            maxDate={filters.endDate ? new Date(filters.endDate) : new Date()}
            w={150}
          />
          
          <DateInput
            label="End Date"
            value={filters.endDate ? new Date(filters.endDate) : null}
            onChange={handleEndDateChange}
            placeholder="Select end date"
            minDate={filters.startDate ? new Date(filters.startDate) : undefined}
            maxDate={new Date()}
            w={150}
          />
        </>
      )}
    </Group>
  );
};