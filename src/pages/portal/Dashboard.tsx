import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { useLeadStats } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PortalDashboard: React.FC = () => {
  const { data: franchiseeData } = useFranchiseeData();
  const { data: leadStats } = useLeadStats(franchiseeData?.id);

  const { data: locationCount = 0 } = useQuery({
    queryKey: ['location-count', franchiseeData?.id],
    queryFn: async (): Promise<number> => {
      if (!franchiseeData?.id) return 0;
      
      const result = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('franchisee_id', franchiseeData.id)
        .eq('is_active', true);

      if (result.error) {
        console.error('Error fetching location count:', result.error);
        return 0;
      }

      return result.count || 0;
    },
    enabled: !!franchiseeData?.id,
  });

  const { data: classCount = 0 } = useQuery({
    queryKey: ['class-count', franchiseeData?.id],
    queryFn: async (): Promise<number> => {
      if (!franchiseeData?.id) return 0;
      
      const result = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('franchisee_id', franchiseeData.id)
        .eq('is_active', true);

      if (result.error) {
        console.error('Error fetching class count:', result.error);
        return 0;
      }

      return result.count || 0;
    },
    enabled: !!franchiseeData?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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
            <div className="text-2xl font-bold">{classCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationCount}</div>
            <p className="text-xs text-muted-foreground">
              Active locations
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
