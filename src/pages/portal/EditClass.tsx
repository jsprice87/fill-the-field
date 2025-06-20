import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EditClassProps {
  franchiseeId?: string;
}

const EditClass: React.FC<EditClassProps> = ({ franchiseeId: propFranchiseeId }) => {
  const { classId, franchiseeSlug } = useParams<{ classId: string; franchiseeSlug: string }>();
  const navigate = useNavigate();

  const [className, setClassName] = useState('');
  const [duration, setDuration] = useState(60);
  const [capacity, setCapacity] = useState(12);
  const [locationId, setLocationId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [currentFranchiseeId, setCurrentFranchiseeId] = useState<string | null>(propFranchiseeId || null);

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
    const fetchData = async () => {
      if (!classId || !currentFranchiseeId) {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch class details
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();

        if (classError) {
          console.error("Error fetching class:", classError);
          toast.error("Failed to load class details");
          return;
        }

        setClassName(classData.name);
        setDuration(classData.duration_minutes);
        setCapacity(classData.max_capacity);
        setLocationId(classData.location_id);
        setIsActive(classData.is_active);

        // Fetch locations for the franchisee
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('franchisee_id', currentFranchiseeId);

        if (locationsError) {
          console.error("Error fetching locations:", locationsError);
          toast.error("Failed to load locations");
          return;
        }

        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId, currentFranchiseeId]);

  const handleSave = async () => {
    if (!classId) {
      toast.error("Class ID is missing");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: className,
          class_name: className,
          duration_minutes: duration,
          max_capacity: capacity,
          location_id: locationId,
          is_active: isActive,
        })
        .eq('id', classId);

      if (error) {
        console.error("Error updating class:", error);
        toast.error("Failed to update class");
        return;
      }

      toast.success("Class updated successfully");
      navigate(`/${franchiseeSlug}/portal/classes/list`);
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Failed to save class");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!classId) {
      toast.error("Class ID is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) {
        console.error("Error deleting class:", error);
        toast.error("Failed to delete class");
        return;
      }

      toast.success("Class deleted successfully");
      navigate(`/${franchiseeSlug}/portal/classes/list`);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit Class</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/${franchiseeSlug}/portal/classes/list`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="animate-pulse">Deleting...</span>
              </>
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <Card.Section>
          <Card.Section>
            Class Details
          </Card.Section>
        </Card.Section>
        <Card.Section className="space-y-4">
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
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Enter capacity"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
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
          <div className="grid gap-2">
            <Label htmlFor="is-active">Active</Label>
            <Input
              id="is-active"
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};

export default EditClass;
