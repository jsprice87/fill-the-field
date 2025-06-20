
import React, { useState } from 'react';
import { Title, Text, SimpleGrid, ScrollArea, rem, Stack, Group, Box } from '@mantine/core';
import { MetricCard, StickyHeader } from '@/components/mantine';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Users, Filter } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useLocations } from '@/hooks/useLocations';
import { useBookingsSearch } from '@/hooks/useBookingsSearch';
import { useSearchParams } from 'react-router-dom';
import BookingsTable from '@/components/bookings/BookingsTable';
import SearchInput from '@/components/shared/SearchInput';
import ArchiveToggle from '@/components/shared/ArchiveToggle';
import { PortalShell } from '@/layout/PortalShell';

const PortalBookings: React.FC = () => {
  const { data: franchiseeData } = useFranchiseeData();
  const [searchParams] = useSearchParams();
  const includeArchived = searchParams.get('archived') === 'true';
  
  const { data: bookings = [], isLoading } = useBookings(franchiseeData?.id, includeArchived);
  const { data: locations = [] } = useLocations(franchiseeData?.id);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const { searchTerm, searchQuery, filteredBookings, handleSearchChange } = useBookingsSearch(bookings, includeArchived);

  // Combine location filter with search results
  const finalBookings = selectedLocationId === 'all' 
    ? filteredBookings 
    : filteredBookings.filter(booking => 
        booking.class_schedules?.classes?.locations?.name === locations.find(l => l.id === selectedLocationId)?.name
      );

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
    return includeArchived ? "Search all bookings..." : "Search bookings...";
  };

  // Prepare metrics data
  const metrics = [
    {
      label: 'Total Bookings',
      value: finalBookings.length,
      icon: Calendar,
      description: searchQuery || selectedLocationId !== 'all' || includeArchived
        ? 'Current filter' 
        : 'All locations'
    },
    {
      label: 'Upcoming',
      value: finalBookings.filter(booking => booking.status === 'booked_upcoming').length,
      icon: Users,
      description: 'Ready to attend'
    },
    {
      label: 'Need Status',
      value: finalBookings.filter(booking => {
        const today = new Date();
        const bookingDate = new Date(booking.selected_date || '');
        return bookingDate < today && booking.status === 'booked_upcoming';
      }).length,
      icon: User,
      description: 'Past date, needs update'
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
                {includeArchived ? 'All Bookings' : 'Bookings'}
              </Title>
              
              <Group gap="md">
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
            <BookingsTable 
              bookings={finalBookings} 
              searchQuery={searchQuery} 
              showArchived={includeArchived}
            />
          </ScrollArea>
        </Box>
      </Stack>
    </PortalShell>
  );
};

export default PortalBookings;
