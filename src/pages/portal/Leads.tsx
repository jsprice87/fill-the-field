
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadsTableEmpty from '@/components/leads/LeadsTableEmpty';
import ArchiveToggle from '@/components/shared/ArchiveToggle';
import AdvancedSearchInput from '@/components/shared/AdvancedSearchInput';
import StatusFilter from '@/components/shared/StatusFilter';
import DateRangeFilter from '@/components/shared/DateRangeFilter';
import { useLeads, useLeadStats } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import type { Lead, LeadStatus } from '@/types';

const Leads: React.FC = () => {
  const franchiseeData = useFranchiseeData();
  const [includeArchived, setIncludeArchived] = React.useState(false);
  
  const { data: leads = [], isLoading, error } = useLeads(
    franchiseeData?.id,
    includeArchived
  );
  
  const { data: stats } = useLeadStats(franchiseeData?.id, includeArchived);

  // Sort options for leads
  const sortOptions = [
    { key: 'created_at', label: 'Date Created', direction: 'desc' as const },
    { key: 'created_at', label: 'Date Created', direction: 'asc' as const },
    { key: 'updated_at', label: 'Last Updated', direction: 'desc' as const },
    { key: 'updated_at', label: 'Last Updated', direction: 'asc' as const },
    { key: 'first_name', label: 'First Name', direction: 'asc' as const },
    { key: 'first_name', label: 'First Name', direction: 'desc' as const },
    { key: 'last_name', label: 'Last Name', direction: 'asc' as const },
    { key: 'last_name', label: 'Last Name', direction: 'desc' as const },
    { key: 'status', label: 'Status', direction: 'asc' as const },
    { key: 'status', label: 'Status', direction: 'desc' as const }
  ];

  // Advanced search hook
  const {
    searchState,
    filteredData,
    hasActiveFilters,
    updateSearchTerm,
    updateStatusFilter,
    updateDateRange,
    updateSort,
    clearAllFilters
  } = useAdvancedSearch<Lead>(
    leads,
    ['first_name', 'last_name', 'email', 'phone', 'zip', 'status', 'source', 'notes'],
    { key: 'created_at', label: 'Date Created', direction: 'desc' }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Error loading leads. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your potential customers
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              All Leads
              {hasActiveFilters && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredData.length} of {leads.length})
                </span>
              )}
            </CardTitle>
            <ArchiveToggle 
              includeArchived={includeArchived}
              onToggle={setIncludeArchived}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Advanced Search */}
          <AdvancedSearchInput
            value={searchState.searchTerm}
            onChange={updateSearchTerm}
            onClear={() => updateSearchTerm('')}
            placeholder="Search leads by name, email, phone, zip, status, or notes..."
            sortOptions={sortOptions}
            currentSort={searchState.currentSort}
            onSortChange={updateSort}
          />

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusFilter
              selectedStatuses={searchState.selectedStatuses}
              onStatusChange={updateStatusFilter}
            />
            
            <DateRangeFilter
              dateRange={searchState.dateRange}
              onDateRangeChange={updateDateRange}
              label="Created Date"
            />

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Results */}
          {filteredData.length === 0 && leads.length > 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No leads match your current filters.
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          ) : filteredData.length === 0 ? (
            <LeadsTableEmpty />
          ) : (
            <LeadsTable leads={filteredData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
