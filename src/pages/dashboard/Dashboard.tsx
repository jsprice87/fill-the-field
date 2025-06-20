import React from 'react';
import { Card } from '@mantine/core';
import { Users, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const Dashboard: React.FC = () => {
  const { data: franchiseeData } = useFranchiseeData();
  const { data: leadStats } = useLeads(franchiseeData?.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <Card.Section className="flex items-center justify-between p-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <p className="text-2xl font-bold text-gray-900">{leadStats?.totalLeads || 0}</p>
            <p className="text-sm text-gray-500">
              {leadStats?.monthlyGrowth > 0 ? '+' : ''}{leadStats?.monthlyGrowth || 0}% from last month
            </p>
          </div>
          <Users className="h-6 w-6 text-gray-400" />
        </Card.Section>
      </Card>

      <Card>
        <Card.Section className="flex items-center justify-between p-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Classes</h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
          <Calendar className="h-6 w-6 text-gray-400" />
        </Card.Section>
      </Card>

      <Card>
        <Card.Section className="flex items-center justify-between p-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold text-gray-900">{leadStats?.conversionRate || 0}%</p>
            <p className="text-sm text-gray-500">Leads to bookings</p>
          </div>
          <TrendingUp className="h-6 w-6 text-gray-400" />
        </Card.Section>
      </Card>

      <Card>
        <Card.Section className="flex items-center justify-between p-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">$0</p>
            <p className="text-sm text-gray-500">Monthly revenue</p>
          </div>
          <DollarSign className="h-6 w-6 text-gray-400" />
        </Card.Section>
      </Card>
    </div>
  );
};

export default Dashboard;
