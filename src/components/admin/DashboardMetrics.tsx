import React from 'react';
import { Card, Text, Group, Loader, Alert, Stack } from '@mantine/core';
import { IconUsers, IconTrendingUp, IconMail, IconCalendar, IconCurrencyDollar, IconServer } from '@tabler/icons-react';
import { AdminDashboardData } from '@/hooks/useAdminDashboard';

interface DashboardMetricsProps {
  data?: AdminDashboardData;
  loading?: boolean;
  error?: Error | null;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  growth?: number;
  color?: string;
}> = ({ title, value, icon, growth, color = 'blue' }) => {
  const formatGrowth = (growth?: number) => {
    if (growth === undefined) return null;
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getGrowthColor = (growth?: number) => {
    if (growth === undefined) return 'dimmed';
    return growth >= 0 ? 'green' : 'red';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <div style={{ color: `var(--mantine-color-${color}-6)` }}>
          {icon}
        </div>
      </Group>
      
      <Text size="xl" fw={700} mb="xs">
        {typeof value === 'number' && title.includes('Revenue') 
          ? `$${value.toLocaleString()}` 
          : value.toLocaleString()}
      </Text>
      
      {growth !== undefined && (
        <Text size="xs" c={getGrowthColor(growth)}>
          {formatGrowth(growth)} from last period
        </Text>
      )}
    </Card>
  );
};

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  data, 
  loading = false, 
  error 
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading dashboard metrics...</Text>
        </Stack>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error loading dashboard data">
        {error.message || 'Failed to load dashboard metrics. Please try again.'}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert color="yellow" title="No data available">
        Dashboard metrics are not available at this time.
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'maintenance': return 'yellow';
      case 'offline': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
      <MetricCard
        title="Total Users"
        value={data.totalUsers}
        icon={<IconUsers size={20} />}
        color="blue"
      />
      
      <MetricCard
        title="New Signups"
        value={data.newSignupsThisMonth}
        icon={<IconTrendingUp size={20} />}
        growth={data.userGrowthPercentage}
        color="green"
      />
      
      <MetricCard
        title="Total Leads"
        value={data.totalLeads}
        icon={<IconMail size={20} />}
        color="orange"
      />
      
      <MetricCard
        title="Total Bookings"
        value={data.totalBookings}
        icon={<IconCalendar size={20} />}
        color="purple"
      />
      
      <MetricCard
        title="Total Revenue"
        value={data.totalRevenue}
        icon={<IconCurrencyDollar size={20} />}
        growth={data.revenueGrowthPercentage}
        color="teal"
      />
      
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            System Status
          </Text>
          <IconServer size={20} color={`var(--mantine-color-${getStatusColor(data.systemStatus)}-6)`} />
        </Group>
        
        <Text 
          size="xl" 
          fw={700} 
          c={getStatusColor(data.systemStatus)}
          tt="capitalize"
        >
          {data.systemStatus}
        </Text>
      </Card>
    </div>
  );
};