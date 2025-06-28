
import React, { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { Badge, Stack, Group, Flex, Title, Text } from '@mantine/core';
import { Card } from '@mantine/core';
import { Plus, Calendar, MapPin, Users, Clock, Edit, Trash, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('class_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
        return;
      }

      toast.success('Class deleted successfully');
      fetchClasses(); // Refresh the class list
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Stack gap="xl">
      <Flex justify="space-between" align="center">
        <Title order={1}>All Classes</Title>
        <Button onClick={() => navigate('/portal/classes/add')} leftSection={<Plus size={16} />}>
          Add Class
        </Button>
      </Flex>

      {isLoading ? (
        <Text ta="center">Loading classes...</Text>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {classes.map((classSchedule) => (
            <Card key={classSchedule.id}>
              <Card.Section withBorder>
                <Flex justify="space-between" align="center" p="md">
                  <Text fw={500}>{classSchedule.classes.name}</Text>
                  <Badge color="gray">
                    {daysOfWeek[classSchedule.day_of_week]}
                  </Badge>
                </Flex>
              </Card.Section>
              <Card.Section p="md">
                <Stack gap="xs">
                  <Group gap="sm">
                    <Calendar size={16} color="gray" />
                    <Text size="sm">{classSchedule.date_start ? new Date(classSchedule.date_start).toLocaleDateString() : 'N/A'}</Text>
                  </Group>
                  <Group gap="sm">
                    <Clock size={16} color="gray" />
                    <Text size="sm">{classSchedule.start_time} - {classSchedule.end_time}</Text>
                  </Group>
                  <Group gap="sm">
                    <MapPin size={16} color="gray" />
                    <Text size="sm">{classSchedule.classes.locations.name}, {classSchedule.classes.locations.city}</Text>
                  </Group>
                  <Group gap="sm">
                    <Users size={16} color="gray" />
                    <Text size="sm">{classSchedule.classes.max_capacity}</Text>
                  </Group>
                </Stack>
              </Card.Section>
              <Card.Section withBorder>
                <Flex justify="flex-end" gap="sm" p="md">
                  <Button
                    variant="subtle"
                    size="sm"
                    leftSection={<Edit size={16} />}
                    onClick={() => navigate(`/portal/classes/edit/${classSchedule.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    color="red"
                    leftSection={<Trash size={16} />}
                    onClick={() => handleDeleteClass(classSchedule.id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Card.Section>
            </Card>
          ))}
        </div>
      )}
    </Stack>
  );
};

export default ClassesList;
