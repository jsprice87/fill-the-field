
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill The Field - Fast Funnels for Free Trials
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <img 
            src="/lovable-uploads/091e49b6-e2e1-413d-a1ac-f2763a697649.png" 
            alt="Fill The Field logo" 
            className="h-10 w-auto hidden md:block"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{leadStats?.monthlyGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Loading...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Loading...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Leads to bookings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalDashboard;
