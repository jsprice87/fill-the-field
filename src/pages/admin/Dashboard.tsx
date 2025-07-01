
import React, { useState } from 'react';
import { Title, Stack, Space } from '@mantine/core';
import { useAdminDashboard, DashboardFilters } from '@/hooks/useAdminDashboard';
import { DashboardMetrics } from '@/components/admin/DashboardMetrics';
import { TimePeriodSelector } from '@/components/admin/TimePeriodSelector';

const AdminDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({ timeRange: '30d' });
  const { data, isLoading, error } = useAdminDashboard(filters);

  return (
    <Stack gap="lg">
      <Title order={1}>Fill The Field Admin Dashboard</Title>
      
      <TimePeriodSelector 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
      
      <Space h="md" />
      
      <DashboardMetrics 
        data={data} 
        loading={isLoading} 
        error={error} 
      />
    </Stack>
  );
};

export default AdminDashboard;
