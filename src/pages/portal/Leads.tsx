
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, Phone } from 'lucide-react';
import { useLeads, useLeadStats } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useLeadsSearch } from '@/hooks/useLeadsSearch';
import { useSearchParams } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import SearchInput from '@/components/shared/SearchInput';
import ArchiveToggle from '@/components/shared/ArchiveToggle';

const PortalLeads: React.FC = () => {
  const { data: franchiseeData } = useFranchiseeData();
  const [searchParams] = useSearchParams();
  const includeArchived = searchParams.get('archived') === 'true';
  
  const { data: leads = [], isLoading } = useLeads(franchiseeData?.id, includeArchived);
  const { data: stats } = useLeadStats(franchiseeData?.id, includeArchived);
  const { searchTerm, searchQuery, filteredLeads, handleSearchChange } = useLeadsSearch(leads, includeArchived);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
        </div>
      </div>
    );
  }

  const getSearchPlaceholder = () => {
    return includeArchived ? "Search all leads..." : "Search leads...";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {includeArchived ? 'All Leads' : 'Leads'}
        </h1>
        <div className="flex items-center gap-4">
          <ArchiveToggle />
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={getSearchPlaceholder()}
            className="w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchQuery ? filteredLeads.length : (stats?.totalLeads || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {searchQuery 
                ? `Matching "${searchQuery}"` 
                : includeArchived 
                  ? 'Including archived'
                  : `+${stats?.monthlyGrowth || 0}% from last month`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchQuery 
                ? filteredLeads.filter(lead => lead.status === 'new').length
                : (stats?.newLeads || 0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting contact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Leads to bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Follow-up</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(searchQuery ? filteredLeads : leads).filter(lead => 
                ['new', 'follow_up'].includes(lead.status)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Action required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <LeadsTable 
        leads={filteredLeads} 
        searchQuery={searchQuery} 
        showArchived={includeArchived}
      />
    </div>
  );
};

export default PortalLeads;
