import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminDashboardData {
  totalUsers: number;
  newSignupsThisMonth: number;
  userGrowthPercentage: number;
  totalLeads: number;
  totalBookings: number;
  totalRevenue: number;
  revenueGrowthPercentage: number;
  systemStatus: 'online' | 'offline' | 'maintenance';
}

interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const useAdminDashboard = (filters: DashboardFilters = { timeRange: '30d' }) => {
  return useQuery({
    queryKey: ['admin-dashboard', filters],
    queryFn: async (): Promise<AdminDashboardData> => {
      const now = new Date();
      let startDate: Date;
      let endDate = now;

      // Calculate date range based on filters
      if (filters.timeRange === 'custom' && filters.startDate && filters.endDate) {
        startDate = new Date(filters.startDate);
        endDate = new Date(filters.endDate);
      } else {
        const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      }

      const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));

      try {
        // Get total users (franchisees)
        const { data: users, error: usersError } = await supabase
          .from('franchisees')
          .select('id, created_at')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        const totalUsers = users?.length || 0;

        // Get new signups in current period
        const newSignupsThisMonth = users?.filter(user => 
          new Date(user.created_at) >= startDate && new Date(user.created_at) <= endDate
        ).length || 0;

        // Get previous period signups for growth calculation
        const prevSignups = users?.filter(user => 
          new Date(user.created_at) >= prevStartDate && new Date(user.created_at) < startDate
        ).length || 0;

        const userGrowthPercentage = prevSignups > 0 
          ? ((newSignupsThisMonth - prevSignups) / prevSignups) * 100 
          : newSignupsThisMonth > 0 ? 100 : 0;

        // Get total leads across all franchisees
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, created_at');

        if (leadsError) throw leadsError;

        const totalLeads = leads?.length || 0;

        // Get total bookings across all franchisees
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, created_at');

        if (bookingsError) throw bookingsError;

        const totalBookings = bookings?.length || 0;

        // Calculate revenue (placeholder - will be updated with Stripe integration)
        // For now, assume $50 average per booking
        const totalRevenue = totalBookings * 50;
        const revenueGrowthPercentage = 0; // Will be calculated with real payment data

        return {
          totalUsers,
          newSignupsThisMonth,
          userGrowthPercentage: Math.round(userGrowthPercentage * 100) / 100,
          totalLeads,
          totalBookings,
          totalRevenue,
          revenueGrowthPercentage,
          systemStatus: 'online' as const,
        };
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export type { AdminDashboardData, DashboardFilters };