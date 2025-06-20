import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useLocations } from '@/hooks/useLocations';

interface AddClassProps {
  franchiseeId?: string;
}

interface Location {
  id: string;
  name: string;
}

const AddClasses: React.FC<AddClassProps> = ({ franchiseeId: propFranchiseeId }) => {
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [capacity, setCapacity] = useState(12);
  const [minAge, setMinAge] = useState(5);
  const [maxAge, setMaxAge] = useState(12);
  const [locationId, setLocationId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentFranchiseeId, setCurrentFranchiseeId] = useState<string | null>(propFranchiseeId || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (propFranchiseeId) {
      setCurrentFranchiseeId(propFranchiseeId);
      return;
    }

    const getFranchiseeId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("Authentication required");
          return;
        }

        const { data: franchisee, error } = await supabase
          .from('franchisees')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (error || !franchisee) {
          console.error("Error fetching franchisee:", error);
          toast.error("Unable to find franchisee account");
          return;
        }

        setCurrentFranchiseeId(franchisee.id);
      } catch (error) {
        console.error("Error getting franchisee:", error);
        toast.error("Failed to authenticate");
      }
    };

    getFranchiseeId();
  }, [propFranchiseeId]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!currentFranchiseeId) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name')
          .eq('franchisee_id', currentFranchiseeId);

        if (error) {
          console.error("Error fetching locations:", error);
          toast.error("Failed to load locations");
          return;
        }

        setLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to load locations");
      }
    };

    fetchLocations();
  }, [currentFranchiseeId]);

  const handleSave = async () => {
    if (!currentFranchiseeId) {
      toast.error("Franchisee ID is missing");
      return;
    }

    setIsSaving(true);
    try {
      // Insert into classes table
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert([
          {
            franchisee_id: currentFranchiseeId,
            name: className,
            class_name: className,
            description: description,
            duration_minutes: duration,
            max_capacity: capacity,
            min_age: minAge,
            max_age: maxAge,
            location_id: locationId,
            is_active: true,
          },
        ])
        .select()

      if (classError) {
        console.error("Error creating class:", classError);
        toast.error("Failed to create class");
        return;
      }

      // Insert into class_schedules table
      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .insert([
          {
            class_id: classData?.[0]?.id,
            start_time: startTime,
            end_time: endTime,
            date_start: startDate || null,
            date_end: endDate || null,
            day_of_week: dayOfWeek,
            current_bookings: 0,
            is_active: true,
          },
        ]);

      if (scheduleError) {
        console.error("Error creating class schedule:", scheduleError);
        toast.error("Failed to create class schedule");
        return;
      }

      toast.success("Class created successfully");
      navigate('/portal/classes/list');
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Failed to save class");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portal/classes/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Add Class</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="animate-pulse">Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      <Card>
        <Card.Section>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <BookOpen className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Class Details</h3>
          </Card.Section>
        </Card.Section>
        <Card.Section className="space-y-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              type="text"
              placeholder="Enter class name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class-description">Class Description</Label>
            <Textarea
              id="class-description"
              placeholder="Enter class description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Enter duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Enter capacity"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-age">Min Age</Label>
              <Input
                id="min-age"
                type="number"
                placeholder="Enter minimum age"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-age">Max Age</Label>
              <Input
                id="max-age"
                type="number"
                placeholder="Enter maximum age"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card.Section>
      </Card>

      <Card>
        <Card.Section>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Schedule Details</h3>
          </Card.Section>
        </Card.Section>
        <Card.Section className="space-y-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="day-of-week">Day of Week</Label>
            <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};

export default AddClasses;
