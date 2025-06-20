import React, { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { Plus, Calendar, MapPin, Users, Clock, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

export interface ScheduleRow {
  className: string;
  dayOfWeek: number;
  duration: number;
  timeStart: string;
  timeEnd: string;
  dateStart: string;
  dateEnd: string;
  overrideDates: string[];
  minAge: number;
  maxAge: number;
  capacity: number;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Classes</h1>
        <Button onClick={() => navigate('/portal/classes/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading classes...</div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classSchedule) => (
            <Card key={classSchedule.id}>
              <Card.Section>
                <Card.Section className="flex items-center justify-between p-4 border-b">
                  {classSchedule.classes.name}
                  <Badge variant="secondary">
                    {daysOfWeek[classSchedule.day_of_week]}
                  </Badge>
                </Card.Section>
              </Card.Section>
              <Card.Section className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{classSchedule.date_start ? new Date(classSchedule.date_start).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{classSchedule.start_time} - {classSchedule.end_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{classSchedule.classes.locations.name}, {classSchedule.classes.locations.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{classSchedule.classes.max_capacity}</span>
                </div>
              </Card.Section>
              <Card.Section className="flex justify-end space-x-2 p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/portal/classes/edit/${classSchedule.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteClass(classSchedule.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </Card.Section>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesList;
