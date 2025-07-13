import React, { useState, useEffect } from 'react';
import { Button, Stack, Group, Text, Table, Badge } from '@mantine/core';
import { Plus, Users, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationClass {
  id: string;
  name: string;
  class_name: string;
  description: string | null;
  min_age: number | null;
  max_age: number | null;
  max_capacity: number;
  duration_minutes: number;
  is_active: boolean | null;
  schedule_count: number;
}

interface LocationClassesProps {
  locationId: string;
  locationName: string;
}

const LocationClasses: React.FC<LocationClassesProps> = ({ locationId, locationName }) => {
  const [classes, setClasses] = useState<LocationClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        
        // Fetch classes for this location with schedule count
        const { data, error } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            class_name,
            description,
            min_age,
            max_age,
            max_capacity,
            duration_minutes,
            is_active,
            class_schedules!inner(id)
          `)
          .eq('location_id', locationId);

        if (error) {
          console.error('Error fetching classes:', error);
          toast.error('Failed to load classes');
          return;
        }

        // Process data to count schedules
        const classesWithScheduleCount = (data || []).map(classItem => ({
          ...classItem,
          schedule_count: classItem.class_schedules?.length || 0
        }));

        setClasses(classesWithScheduleCount);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [locationId]);

  const formatAgeRange = (minAge: number | null, maxAge: number | null): string => {
    if (!minAge && !maxAge) return 'All ages';
    if (!minAge) return `Up to ${maxAge} years`;
    if (!maxAge) return `${minAge}+ years`;
    if (minAge === maxAge) return `${minAge} years`;
    return `${minAge}-${maxAge} years`;
  };

  const handleAddClasses = () => {
    navigate(`../classes/add?location=${locationId}`);
  };

  const handleEditClass = (classId: string) => {
    navigate(`../classes/edit/${classId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <Text size="lg" fw={500} c="dimmed" mb="sm">
            No classes at this location
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            Add your first class to start offering programs at {locationName}
          </Text>
          <Button onClick={handleAddClasses}>
            <Plus className="h-4 w-4 mr-2" />
            Add Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <Group justify="space-between" align="center" mb="md">
        <Group align="center" gap="xs">
          <Users className="h-5 w-5 text-gray-500" />
          <Text size="sm" c="dimmed">
            {classes.length} {classes.length === 1 ? 'class' : 'classes'} available
          </Text>
        </Group>
        <Button variant="outline" size="sm" onClick={handleAddClasses}>
          <Plus className="h-4 w-4 mr-2" />
          Add Classes
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Class Name</Table.Th>
            <Table.Th>Age Range</Table.Th>
            <Table.Th>Duration</Table.Th>
            <Table.Th>Capacity</Table.Th>
            <Table.Th>Schedules</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {classes.map((classItem) => (
            <Table.Tr key={classItem.id}>
              <Table.Td>
                <div>
                  <Text fw={500} size="sm">
                    {classItem.name}
                  </Text>
                  {classItem.description && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {classItem.description}
                    </Text>
                  )}
                </div>
              </Table.Td>
              <Table.Td>
                <Group align="center" gap="xs">
                  <Users className="h-4 w-4 text-gray-400" />
                  <Text size="sm">
                    {formatAgeRange(classItem.min_age, classItem.max_age)}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Group align="center" gap="xs">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Text size="sm">
                    {classItem.duration_minutes} min
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {classItem.max_capacity} {classItem.max_capacity === 1 ? 'child' : 'children'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group align="center" gap="xs">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <Text size="sm">
                    {classItem.schedule_count} {classItem.schedule_count === 1 ? 'schedule' : 'schedules'}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge 
                  color={classItem.is_active ? 'green' : 'red'} 
                  variant="light"
                  size="sm"
                >
                  {classItem.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Button 
                  variant="subtle" 
                  size="xs"
                  onClick={() => handleEditClass(classItem.id)}
                >
                  Edit
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default LocationClasses;