import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Clock, ArrowLeft, Loader, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  date_start: string | null;
  date_end: string | null;
  current_bookings: number;
  max_capacity?: number;
  classes: {
    name: string;
    description: string;
    min_age: number;
    max_age: number;
    locations: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
  };
}

const FindClasses: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();

  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);
  const [metaPixelId, setMetaPixelId] = useState<string | null>(null);

  const fetchFranchiseeTimezone = async (id: string) => {
    const { data, error } = await supabase
      .from('franchisee_settings')
      .select('setting_key, setting_value')
      .eq('franchisee_id', id)
      .eq('setting_key', 'timezone');

    if (error) {
      console.error('Error fetching timezone:', error);
      return 'America/New_York'; // Default timezone
    }

    const settingsData = data as any;
    if (settingsData && settingsData.length > 0) {
      return settingsData[0].setting_value || 'America/New_York';
    }

    return 'America/New_York';
  };

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: settings, error: settingsError } = await (supabase as any)
          .from('franchisee_settings')
          .select('setting_key, setting_value')
          .eq('franchisee_slug', franchiseeSlug);

        if (settingsError) {
          console.error('Error fetching franchisee settings:', settingsError);
          setError('Failed to load franchisee settings.');
          return;
        }

        const settingsData = settings as any;
        const pixelSetting = settingsData?.find((s: any) => s.setting_key === 'meta_pixel_id');
        setMetaPixelId(pixelSetting?.setting_value || null);

        const { data: classScheduleData, error: classScheduleError } = await (supabase as any)
          .from('class_schedules')
          .select(`
            id,
            class_id,
            start_time,
            end_time,
            day_of_week,
            date_start,
            date_end,
            current_bookings,
            classes (
              name,
              description,
              min_age,
              max_age,
              locations (
                name,
                address,
                city,
                state,
                zip
              )
            )
          `)
          .eq('classes.locations.franchisee_slug', franchiseeSlug);

        if (classScheduleError) {
          console.error('Error fetching class schedules:', classScheduleError);
          setError('Failed to load class schedules.');
          return;
        }

        if (!classScheduleData) {
          setClassSchedules([]);
          return;
        }

        setClassSchedules(classScheduleData as any);

        // Extract unique locations for filtering
        const locationNames = new Set(
          classScheduleData.map((schedule: any) => String(schedule.classes.locations.name))
        );
        const uniqueLocations: { value: string; label: string }[] = Array.from(locationNames).map((name: string) => ({
          value: name,
          label: name,
        }));
        setLocationOptions([{ value: 'all', label: 'All Locations' }, ...uniqueLocations]);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [franchiseeSlug]);

  const filteredClasses = classSchedules.filter((schedule) => {
    const locationMatch =
      locationFilter === 'all' || schedule.classes.locations.name === locationFilter;
    const dayMatch =
      dayFilter === 'all' || schedule.day_of_week.toString() === dayFilter;
    const searchMatch =
      searchTerm === '' ||
      schedule.classes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.classes.description.toLowerCase().includes(searchTerm.toLowerCase());

    return locationMatch && dayMatch && searchMatch;
  });

  const handleBooking = (classSchedule: ClassSchedule) => {
    navigate(`/${franchiseeSlug}/booking/class/${classSchedule.id}`);
  };

  const daysOfWeek = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <MetaPixelProvider franchiseeId={metaPixelId || ''}>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Find Classes</CardTitle>
            <Badge variant="secondary">
              {filteredClasses.length} Classes Found
            </Badge>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4">
              <div className="col-span-1">
                <Input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={dayFilter} onValueChange={setDayFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((schedule) => (
                <Card key={schedule.id} className="bg-white shadow-md rounded-md overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">{schedule.classes.name}</CardTitle>
                    <Badge variant="outline">
                      {daysOfWeek.find(day => day.value === schedule.day_of_week.toString())?.label}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{schedule.classes.locations.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{schedule.date_start ? new Date(schedule.date_start).toLocaleDateString() : 'Ongoing'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{schedule.start_time} - {schedule.end_time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{schedule.current_bookings}/{schedule.max_capacity || 'Unlimited'}</span>
                    </div>
                    <p className="text-gray-700 mt-2">{schedule.classes.description}</p>
                    <Button className="mt-4 w-full" onClick={() => handleBooking(schedule)}>
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MetaPixelProvider>
  );
};

export default FindClasses;
