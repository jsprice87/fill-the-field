
import React, { useState } from 'react';
import { Title, Text, SimpleGrid, ScrollArea, rem, Stack, Group, Box } from '@mantine/core';
import { MetricCard, StickyHeader, Button } from '@/components/mantine';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Users, Filter, Download } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useLocations } from '@/hooks/useLocations';
import { useLeadsSearch } from '@/hooks/useLeadsSearch';
import { useSearchParams } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import SearchInput from '@/components/shared/SearchInput';
import ArchiveToggle from '@/components/shared/ArchiveToggle';
import { PortalShell } from '@/layout/PortalShell';
import { exportLeadsToCsv } from '@/utils/csvExport';
import { toast } from 'sonner';

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

  const handleExportCsv = () => {
    try {
      exportLeadsToCsv(finalLeads);
      toast.success(`Exported ${finalLeads.length} leads to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  if (isLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="loading-spinner h-8 w-8"></div>
        </Stack>
      </PortalShell>
    );
  }

  const getSearchPlaceholder = () => {
    return includeArchived ? "Search all leads..." : "Search leads...";
  };

  // Prepare metrics data
  const metrics = [
    {
      label: 'Total Leads',
      value: finalLeads.length,
      icon: Calendar,
      description: searchQuery || selectedLocationId !== 'all' || includeArchived
        ? 'Current filter' 
        : 'All locations'
    },
    {
      label: 'New Leads',
      value: finalLeads.filter(lead => lead.status === 'new').length,
      icon: Users,
      description: 'Ready to contact'
    },
    {
      label: 'Contacted',
      value: finalLeads.filter(lead => ['contacted', 'follow_up_scheduled'].includes(lead.status)).length,
      icon: User,
      description: 'In conversation'
    },
    {
      label: 'Locations',
      value: locations.length,
      icon: MapPin,
      description: 'Active locations'
    }
  ];

  return (
    <PortalShell>
      <Stack h="100vh" gap={0} w="100%">
        {/* Sticky Header with Page Title and Filters */}
        <StickyHeader>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={1} size="30px" lh="36px" fw={600}>
                {includeArchived ? 'All Leads' : 'Leads'}
              </Title>
              
              <Group gap="md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={isLoading}
                  leftSection={<Download className="h-4 w-4" />}
                >
                  Export CSV
                </Button>

                <ArchiveToggle />
                
                {/* Location Filter */}
                <Group gap="xs">
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
                </Group>

                {/* Search Input */}
                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={getSearchPlaceholder()}
                  className="w-64"
                />
              </Group>
            </Group>

            {/* Responsive Metrics Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  icon={metric.icon}
                  description={metric.description}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </StickyHeader>

        {/* Scrollable Table Area */}
        <Box w="100%" style={{ overflowX: 'auto' }}>
          <ScrollArea
            scrollbarSize={8}
            offsetScrollbars
            type="scroll"
            h={`calc(100vh - ${rem(180)})`}
            w="100%"
          >
            <LeadsTable 
              leads={finalLeads} 
              searchQuery={searchQuery} 
              showArchived={includeArchived}
            />
          </ScrollArea>
        </Box>
      </Stack>
    </PortalShell>
  );
};

export default PortalLeads;
