
import React, { useState, useEffect } from 'react';
import { Button, Box } from '@mantine/core';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Title, Stack, Group } from '@mantine/core';
import { StickyHeader } from '@/components/mantine';
import { PortalShell } from '@/layout/PortalShell';
import ClassesTable from '@/components/classes/ClassesTable';

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
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </Stack>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Stack h="100vh" gap={0} w="100%">
        <StickyHeader>
          <Group justify="space-between" align="center">
            <Title order={1} size="30px" lh="36px" fw={600}>
              All Classes
            </Title>
            <Button onClick={() => navigate('/portal/classes/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </Group>
        </StickyHeader>

        <Box w="100%" style={{ overflowX: 'auto' }}>
          <ClassesTable classes={classes} onDelete={handleDeleteClass} />
        </Box>
      </Stack>
    </PortalShell>
  );
};

export default ClassesList;
