
import React, { useState, useEffect } from 'react';
import { Button, Box } from '@mantine/core';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Title, Stack, Group, SimpleGrid } from '@mantine/core';
import { StickyHeader, MetricCard } from '@/components/mantine';
import { PortalShell } from '@/layout/PortalShell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import ClassesTable from '@/components/classes/ClassesTable';
import SearchInput from '@/components/shared/SearchInput';
import { useLocations } from '@/hooks/useLocations';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useSearchQuery } from '@/utils/searchUtils';

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  date_start: string | null;
  date_end: string | null;
  day_of_week: number;
  current_bookings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  classes: {
    name: string;
    class_name: string;
    description: string;
    duration_minutes: number;
    max_capacity: number;
    min_age: number;
    max_age: number;
    location_id: string;
    locations: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
  };
}

const ClassesList: React.FC = () => {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { data: franchiseeData } = useFranchiseeData();
  const { data: locations = [] } = useLocations(franchiseeData?.id);
  const { query: searchQuery } = useSearchQuery();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_schedules')
        .select(`
          id,
          class_id,
          start_time,
          end_time,
          date_start,
          date_end,
          day_of_week,
          current_bookings,
          is_active,
          created_at,
          updated_at,
          classes (
            name,
            class_name,
            description,
            duration_minutes,
            max_capacity,
            min_age,
            max_age,
            location_id,
            locations (
              name,
              address,
              city,
              state,
              zip
            )
          )
        `);

      if (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
        return;
      }

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = (deletedId: string) => {
    setClasses(prev => prev.filter(cls => cls.id !== deletedId));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Filter classes by location and search term
  const filteredClasses = classes.filter(classSchedule => {
    const matchesLocation = selectedLocationId === 'all' || 
      classSchedule.classes?.location_id === selectedLocationId;
    
    const matchesSearch = !searchTerm || 
      classSchedule.classes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classSchedule.classes?.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classSchedule.classes?.locations?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

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
      value: filteredClasses.length,
      icon: Calendar,
      description: searchTerm || selectedLocationId !== 'all'
        ? 'Current filter' 
        : 'All locations'
    },
    {
      label: 'Active Classes',
      value: filteredClasses.filter(cls => cls.is_active).length,
      icon: Users,
      description: 'Currently available'
    },
    {
      label: 'Total Bookings',
      value: filteredClasses.reduce((sum, cls) => sum + (cls.current_bookings || 0), 0),
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
          <ClassesTable classes={filteredClasses} onDelete={handleDeleteClass} />
        </Box>
      </Stack>
    </PortalShell>
  );
};

export default ClassesList;
