
import React from 'react';
import { Card } from '@mantine/core';
import { Users, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { useLeadStats } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const PortalDashboard: React.FC = () => {
  const { data: franchiseeData } = useFranchiseeData();
  const { data: leadStats } = useLeadStats(franchiseeData?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Fill The Field - Fast Funnels for Free Trials
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {/* Future: Add action buttons here */}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Card.Section className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <div className="text-body-sm font-medium">Total Leads</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </Card.Section>
          <Card.Section className="p-4">
            <div className="text-h1 font-bold">{leadStats?.totalLeads || 0}</div>
            <p className="text-body-sm text-muted-foreground">
              +{leadStats?.monthlyGrowth || 0}% from last month
            </p>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <div className="text-body-sm font-medium">Active Classes</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </Card.Section>
          <Card.Section className="p-4">
            <div className="text-h1 font-bold">-</div>
            <p className="text-body-sm text-muted-foreground">
              Loading...
            </p>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <div className="text-body-sm font-medium">Total Locations</div>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </Card.Section>
          <Card.Section className="p-4">
            <div className="text-h1 font-bold">-</div>
            <p className="text-body-sm text-muted-foreground">
              Loading...
            </p>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <div className="text-body-sm font-medium">Conversion Rate</div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </Card.Section>
          <Card.Section className="p-4">
            <div className="text-h1 font-bold">{leadStats?.conversionRate || 0}%</div>
            <p className="text-body-sm text-muted-foreground">
              Leads to bookings
            </p>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
};

export default PortalDashboard;
