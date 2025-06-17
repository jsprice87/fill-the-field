
import React, { useState } from 'react';
import { Title, Text } from '@mantine/core';
import { Paper } from '@/components/mantine';
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
      <div className="h-full flex flex-col">
        <header className="pl-sidebar sticky top-0 z-40 px-6 pt-6 pb-4 bg-background border-b">
          <div className="flex items-center justify-between">
            <Title order={1} size="30px" lh="36px" fw={600}>Bookings</Title>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner h-8 w-8"></div>
        </div>
      </div>
    );
  }

  const getSearchPlaceholder = () => {
    return includeArchived ? "Search all bookings..." : "Search bookings...";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Sidebar Clearance */}
      <header className="pl-sidebar sticky top-0 z-40 px-6 pt-6 pb-4 bg-background border-b">
        <div className="flex items-center justify-between mb-6">
          <Title order={1} size="30px" lh="36px" fw={600} c="var(--mantine-color-gray-9)">
            {includeArchived ? 'All Bookings' : 'Bookings'}
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
              <Text size="sm" fw={500}>Total Bookings</Text>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>{finalBookings.length}</Title>
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
              <Text size="sm" fw={500}>Upcoming</Text>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>
                {finalBookings.filter(booking => booking.status === 'booked_upcoming').length}
              </Title>
              <Text size="sm" c="dimmed">
                Ready to attend
              </Text>
            </div>
          </Paper>

          <Paper shadow="sm" radius="lg" p="lg" style={{ transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Text size="sm" fw={500}>Need Status</Text>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Title order={2} size="30px" lh="36px" fw={700}>
                {finalBookings.filter(booking => {
                  const today = new Date();
                  const bookingDate = new Date(booking.selected_date || '');
                  return bookingDate < today && booking.status === 'booked_upcoming';
                }).length}
              </Title>
              <Text size="sm" c="dimmed">
                Past date, needs update
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
          <BookingsTable 
            bookings={finalBookings} 
            searchQuery={searchQuery} 
            showArchived={includeArchived}
          />
        </div>
      </div>
    </div>
  );
};

export default PortalBookings;
