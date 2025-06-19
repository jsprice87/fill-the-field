import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams, useNavigate } from "react-router-dom";
import AgeRangeInput from '@/components/classes/AgeRangeInput';
import MultiDatePicker from '@/components/classes/MultiDatePicker';
import { getSlugFromFranchiseeId } from "@/utils/slugUtils";

interface ClassData {
  id: string;
  name: string;
  class_name: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
  min_age: number;
  max_age: number;
  location_id: string;
  schedule: {
    id: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
    date_start: string | null;
    date_end: string | null;
  } | null;
  exceptions: string[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const EditClass: React.FC = () => {
  const { franchiseeId, classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [locations, setLocations] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  // Get the current slug for navigation
  useEffect(() => {
    if (franchiseeId) {
      if (!franchiseeId.includes('-')) {
        getSlugFromFranchiseeId(franchiseeId).then(slug => {
          setCurrentSlug(slug || franchiseeId);
        });
      } else {
        setCurrentSlug(franchiseeId);
      }
    }
  }, [franchiseeId]);

  useEffect(() => {
    loadClassData();
    loadLocations();
  }, [classId]);

  const loadClassData = async () => {
    if (!classId) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          class_name,
          description,
          duration_minutes,
          max_capacity,
          min_age,
          max_age,
          location_id,
          class_schedules(
            id,
            start_time,
            end_time,
            day_of_week,
            date_start,
            date_end,
            schedule_exceptions(exception_date)
          )
        `)
        .eq('id', classId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error("Error loading class:", error);
        toast.error("Failed to load class data");
        return;
      }

      const schedule = data.class_schedules?.[0] || null;
      const exceptions = schedule?.schedule_exceptions?.map((exc: any) => exc.exception_date) || [];

      setClassData({
        id: data.id,
        name: data.name,
        class_name: data.class_name,
        description: data.description || '',
        duration_minutes: data.duration_minutes,
        max_capacity: data.max_capacity,
        min_age: data.min_age || 3,
        max_age: data.max_age || 12,
        location_id: data.location_id,
        schedule,
        exceptions
      });
    } catch (error) {
      console.error("Error loading class:", error);
      toast.error("Failed to load class data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      if (franchiseeError || !franchisee) return;

      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name')
        .eq('franchisee_id', franchisee.id)
        .eq('is_active', true)
        .order('name');

      if (locationsError) {
        console.error("Error loading locations:", locationsError);
        return;
      }

      setLocations(locationsData || []);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!classData) return;

    setIsSaving(true);
    try {
      // Update class
      const { error: classError } = await supabase
        .from('classes')
        .update({
          name: classData.name,
          class_name: classData.class_name,
          description: classData.description,
          duration_minutes: classData.duration_minutes,
          max_capacity: classData.max_capacity,
          min_age: classData.min_age,
          max_age: classData.max_age,
          location_id: classData.location_id
        })
        .eq('id', classData.id);

      if (classError) {
        console.error("Error updating class:", classError);
        throw classError;
      }

      // Update schedule if it exists
      if (classData.schedule) {
        const { error: scheduleError } = await supabase
          .from('class_schedules')
          .update({
            start_time: classData.schedule.start_time,
            end_time: classData.schedule.end_time,
            day_of_week: classData.schedule.day_of_week,
            date_start: classData.schedule.date_start,
            date_end: classData.schedule.date_end
          })
          .eq('id', classData.schedule.id);

        if (scheduleError) {
          console.error("Error updating schedule:", scheduleError);
          throw scheduleError;
        }

        // Update exceptions
        // First delete existing exceptions
        await supabase
          .from('schedule_exceptions')
          .delete()
          .eq('class_schedule_id', classData.schedule.id);

        // Then insert new exceptions
        if (classData.exceptions.length > 0) {
          const exceptionInserts = classData.exceptions.map(date => ({
            class_schedule_id: classData.schedule!.id,
            exception_date: date,
            is_cancelled: true
          }));

          const { error: exceptionError } = await supabase
            .from('schedule_exceptions')
            .insert(exceptionInserts);

          if (exceptionError) {
            console.error("Error updating exceptions:", exceptionError);
            throw exceptionError;
          }
        }
      }

      toast.success("Class updated successfully!");
      navigate(`/${currentSlug}/portal/classes`);
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Failed to save class. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-64">Loading class data...</div>;
  }

  if (!classData) {
    return <div className="text-center text-red-600">Class not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/${currentSlug}/portal/classes`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <TextInput
              id="class-name"
              value={classData.class_name}
              onChange={(e) => setClassData({...classData, class_name: e.target.value, name: e.target.value})}
              placeholder="Enter class name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <TextInput
              id="description"
              value={classData.description}
              onChange={(e) => setClassData({...classData, description: e.target.value})}
              placeholder="Enter class description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={classData.location_id}
              onValueChange={(value) => setClassData({...classData, location_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
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

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <TextInput
              id="duration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={classData.duration_minutes}
              onChange={(e) => {
                const duration = parseInt(e.target.value) || 60;
                const updatedClassData = {...classData, duration_minutes: duration};
                if (classData.schedule) {
                  updatedClassData.schedule = {
                    ...classData.schedule,
                    end_time: calculateEndTime(classData.schedule.start_time, duration)
                  };
                }
                setClassData(updatedClassData);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Max Capacity</Label>
            <TextInput
              id="capacity"
              type="number"
              min="1"
              max="50"
              value={classData.max_capacity}
              onChange={(e) => setClassData({...classData, max_capacity: parseInt(e.target.value) || 1})}
            />
          </div>

          <div className="space-y-2">
            <Label>Age Range</Label>
            <AgeRangeInput
              minAge={classData.min_age}
              maxAge={classData.max_age}
              onMinAgeChange={(value) => setClassData({...classData, min_age: value})}
              onMaxAgeChange={(value) => setClassData({...classData, max_age: value})}
            />
          </div>
        </div>

        {/* Schedule Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Schedule Information</h3>
          
          {classData.schedule && (
            <>
              <div className="space-y-2">
                <Label htmlFor="day-of-week">Day of Week</Label>
                <Select
                  value={classData.schedule.day_of_week.toString()}
                  onValueChange={(value) => setClassData({
                    ...classData,
                    schedule: {...classData.schedule!, day_of_week: parseInt(value)}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <TextInput
                  id="start-time"
                  type="time"
                  value={classData.schedule.start_time}
                  onChange={(e) => setClassData({
                    ...classData,
                    schedule: {
                      ...classData.schedule!,
                      start_time: e.target.value,
                      end_time: calculateEndTime(e.target.value, classData.duration_minutes)
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <TextInput
                  id="end-time"
                  type="time"
                  value={classData.schedule.end_time}
                  readOnly
                  className="bg-gray-50"
                  title="Auto-calculated based on start time + duration"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-start">Start Date</Label>
                <TextInput
                  id="date-start"
                  type="date"
                  value={classData.schedule.date_start || ''}
                  onChange={(e) => setClassData({
                    ...classData,
                    schedule: {...classData.schedule!, date_start: e.target.value || null}
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-end">End Date</Label>
                <TextInput
                  id="date-end"
                  type="date"
                  value={classData.schedule.date_end || ''}
                  onChange={(e) => setClassData({
                    ...classData,
                    schedule: {...classData.schedule!, date_end: e.target.value || null}
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Exception Dates</Label>
                <MultiDatePicker
                  selectedDates={classData.exceptions}
                  onDatesChange={(dates) => setClassData({...classData, exceptions: dates})}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditClass;
