
import React, { useState } from 'react';
import { Title, Text } from '@mantine/core';
import { Paper } from '@/components/mantine';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Users, Filter } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useLocations } from '@/hooks/useLocations';
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
  const { data: locations = [] } = useLocations(franchiseeData?.id);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const { searchTerm, searchQuery, filteredLeads, handleSearchChange } = useLeadsSearch(leads, includeArchived);

  // Combine location filter with search results
  const finalLeads = selectedLocationId === 'all' 
    ? filteredLeads 
    : filteredLeads.filter(lead => 
        lead.classes?.some(cls => cls.location_id === selectedLocationId)
      );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <header className="pl-sidebar sticky top-0 z-40 px-6 pt-6 pb-4 bg-background border-b">
          <div className="flex items-center justify-between">
            <Title order={1} size="30px" lh="36px" fw={600}>Leads</Title>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner h-8 w-8"></div>
        </div>
      </div>
    );
  }

  const getSearchPlaceholder = () => {
    return includeArchived ? "Search all leads..." : "Search leads...";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Sidebar Clearance */}
      <header className="pl-sidebar sticky top-0 z-40 px-6 pt-6 pb-4 bg-background border-b">
        <div className="flex items-center justify-between mb-6">
          <Title order={1} size="30px" lh="36px" fw={600} c="var(--mantine-color-gray-9)">
            {includeArchived ? 'All Leads' : 'Leads'}
          </Title>
          
          <div className="flex items-center gap-4">
            <ArchiveToggle />
            
            {/* Location Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={getSearchPlaceholder()}
              className="w-64"
            />
          </div>
        </div>

        {/* Responsive Stats Cards using Mantine Paper */}
        <div className="metric-grid">
          <Paper shadow="sm" radius="lg" p="lg" style={{ transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Text size="sm" fw={500}>Total Leads</Text>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>{finalLeads.length}</Title>
              <Text size="sm" c="dimmed">
                {searchQuery || selectedLocationId !== 'all' || includeArchived
                  ? 'Current filter' 
                  : 'All locations'
                }
              </Text>
            </div>
          </Paper>

          <Paper shadow="sm" radius="lg" p="lg" style={{ transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Text size="sm" fw={500}>New Leads</Text>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>
                {finalLeads.filter(lead => lead.status === 'new').length}
              </Title>
              <Text size="sm" c="dimmed">
                Ready to contact
              </Text>
            </div>
          </Paper>

          <Paper shadow="sm" radius="lg" p="lg" style={{ transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Text size="sm" fw={500}>Contacted</Text>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>
                {finalLeads.filter(lead => ['contacted', 'follow_up_scheduled'].includes(lead.status)).length}
              </Title>
              <Text size="sm" c="dimmed">
                In conversation
              </Text>
            </div>
          </Paper>

          <Paper shadow="sm" radius="lg" p="lg" style={{ transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Text size="sm" fw={500}>Locations</Text>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>{locations.length}</Title>
              <Text size="sm" c="dimmed">
                Active locations
              </Text>
            </div>
          </Paper>
        </div>
      </header>

      {/* Table Container with Proper Overflow */}
      <div className="table-container px-6 pb-6">
        <div className="mt-6">
          <LeadsTable 
            leads={finalLeads} 
            searchQuery={searchQuery} 
            showArchived={includeArchived}
          />
        </div>
      </div>
    </div>
  );
};

export default PortalLeads;
