import React, { useState } from 'react';
import { Button, Box } from '@mantine/core';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Title, Stack, Group, SimpleGrid } from '@mantine/core';
import { StickyHeader, MetricCard } from '@/components/mantine';
import { PortalShell } from '@/layout/PortalShell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import ClassesTable from '@/components/classes/ClassesTable';
import SearchInput from '@/components/shared/SearchInput';
import { useLocations } from '@/hooks/useLocations';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useClasses } from '@/hooks/useClasses';

const ClassesList: React.FC = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { data: franchiseeData } = useFranchiseeData();
  const { data: locations = [] } = useLocations(franchiseeData?.id);
  const { data: classes = [], isLoading } = useClasses(
    franchiseeData?.id,
    selectedLocationId === 'all' ? null : selectedLocationId,
    searchTerm
  );

  const handleDeleteClass = (deletedId: string) => {
    // This is no longer needed since React Query handles the cache updates
    // but we keep it for compatibility with the ClassesTable interface
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (isLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </Stack>
      </PortalShell>
    );
  }

  // Prepare metrics data
  const metrics = [
    {
      label: 'Total Classes',
      value: classes.length,
      icon: Calendar,
      description: searchTerm || selectedLocationId !== 'all'
        ? 'Current filter' 
        : 'All locations'
    },
    {
      label: 'Active Classes',
      value: classes.filter(cls => cls.is_active).length,
      icon: Users,
      description: 'Currently available'
    },
    {
      label: 'Total Bookings',
      value: classes.reduce((sum, cls) => sum + (cls.current_bookings || 0), 0),
      icon: Clock,
      description: 'Across all classes'
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
        <StickyHeader>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={1} size="30px" lh="36px" fw={600}>
                Classes
              </Title>
              
              <Group gap="md">
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
                  placeholder="Search classes..."
                  className="w-64"
                />

                <Button onClick={() => navigate('/portal/classes/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
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

        <Box w="100%" style={{ overflowX: 'auto' }}>
          <ClassesTable 
            classes={classes} 
            onDelete={handleDeleteClass}
            franchiseeId={franchiseeData?.id}
            locationId={selectedLocationId === 'all' ? null : selectedLocationId}
            search={searchTerm}
          />
        </Box>
      </Stack>
    </PortalShell>
  );
};

export default ClassesList;
