import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Stack, Group, Title, Card, Table } from '@mantine/core';
import { TableHeader, TableBody, TableRow, TableHead } from '@/components/mantine';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useClass, useUpdateClass } from '@/hooks/useClass';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { ClassFormData } from '@/types/domain';
import ClassRow from '@/components/classes/ClassRow';
import { Loader } from '@/components/ui/Loader';
import dayjs from 'dayjs';

const EditClass: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { data: franchiseeData } = useFranchiseeData();
  
  // Debug: Log the classId from route params
  console.log('EditClass classId from useParams:', classId);
  
  // Debug: Test raw query without joins
  useEffect(() => {
    const testRawQuery = async () => {
      if (!classId) return;
      
      console.log('Testing raw query for classId:', classId);
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, location_id')
        .eq('id', classId)
        .maybeSingle();
      
      console.log('Raw query result:', { data, error });
      
      if (data) {
        console.log('Row exists, testing with franchisee filter...');
        // Test with franchisee filter if we have franchisee data
        if (franchiseeData?.id) {
          const { data: franchiseeFilteredData, error: franchiseeError } = await supabase
            .from('classes')
            .select(`
              id, name, location_id,
              locations!inner (franchisee_id)
            `)
            .eq('id', classId)
            .eq('locations.franchisee_id', franchiseeData.id)
            .maybeSingle();
          
          console.log('Franchisee-filtered query result:', { 
            data: franchiseeFilteredData, 
            error: franchiseeError 
          });
        }
      }
    };
    
    testRawQuery();
  }, [classId, franchiseeData?.id]);
  
  const { data: classData, isLoading } = useClass(classId);
  const updateClassMutation = useUpdateClass();
  
  const [formData, setFormData] = useState<ClassFormData>({
    id: '',
    className: '',
    startTime: '09:00',
    duration: 60,
    endTime: '10:00',
    minAgeYears: 5,
    minAgeMonths: 0,
    maxAgeYears: 12,
    maxAgeMonths: 0,
    capacity: 12,
  });

  // Memoized form initialization to prevent unnecessary re-renders
  const initializedFormData = useMemo(() => {
    // Only proceed if classData exists (not null)
    if (!classData) return null;

    console.time('form-initialization');
    
    // Convert min/max age from months to years+months
    const minAgeYears = Math.floor((classData.min_age || 0) / 12);
    const minAgeMonths = (classData.min_age || 0) % 12;
    const maxAgeYears = Math.floor((classData.max_age || 0) / 12);
    const maxAgeMonths = (classData.max_age || 0) % 12;

    // Get schedule data from the first schedule if available
    const schedule = classData.class_schedules?.[0];
    const startTime = schedule?.start_time || '09:00';
    const endTime = schedule?.end_time || dayjs(`2000-01-01 ${startTime}`)
      .add(classData.duration_minutes, 'minute')
      .format('HH:mm');

    // Remove "(copy)" suffix if present
    const cleanClassName = classData.name.replace(/\s*\(copy\)\s*$/, '').trim();

    const formData: ClassFormData = {
      id: classData.id,
      className: cleanClassName,
      startTime,
      duration: classData.duration_minutes,
      endTime,
      minAgeYears,
      minAgeMonths,
      maxAgeYears,
      maxAgeMonths,
      capacity: classData.max_capacity,
    };

    console.timeEnd('form-initialization');
    return formData;
  }, [classData]);

  useEffect(() => {
    if (initializedFormData) {
      setFormData(initializedFormData);
    }
  }, [initializedFormData]);

  const handleFieldUpdate = (id: string, field: keyof ClassFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate end time when start time or duration changes
      if (field === 'startTime' || field === 'duration') {
        const startTime = field === 'startTime' ? value : prev.startTime;
        const duration = field === 'duration' ? value : prev.duration;
        
        if (startTime && duration) {
          updated.endTime = dayjs(`2000-01-01 ${startTime}`)
            .add(duration, 'minute')
            .format('HH:mm');
        }
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (!classId) {
      toast.error("Class ID is missing");
      return;
    }

    try {
      // Convert age years/months back to total months for storage
      const minAgeMonths = formData.minAgeYears * 12 + formData.minAgeMonths;
      const maxAgeMonths = formData.maxAgeYears * 12 + formData.maxAgeMonths;

      await updateClassMutation.mutateAsync({
        classId,
        updates: {
          name: formData.className,
          class_name: formData.className,
          description: `${formData.className} program`,
          duration_minutes: formData.duration,
          max_capacity: formData.capacity,
          min_age: Math.floor(minAgeMonths / 12), // Store as years for compatibility
          max_age: Math.floor(maxAgeMonths / 12), // Store as years for compatibility  
          is_active: true,
        }
      });

      toast.success("Class updated successfully");
      navigate('/portal/classes');
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class");
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
      navigate('/portal/classes');
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    }
  };

  const isFormValid = () => {
    const isClassNameValid = formData.className.trim() !== '';
    const isDurationValid = formData.duration >= 15 && formData.duration <= 120;
    const isCapacityValid = formData.capacity > 0;
    const isAgeRangeValid = 
      formData.minAgeYears < formData.maxAgeYears || 
      (formData.minAgeYears === formData.maxAgeYears && formData.minAgeMonths <= formData.maxAgeMonths);
    
    return isClassNameValid && isDurationValid && isCapacityValid && isAgeRangeValid;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Title order={1} size="30px" lh="36px" fw={600}>Edit Class</Title>
        <div className="flex justify-center p-8">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      </div>
    );
  }

  // Show "not found" only when data is explicitly null (not undefined during loading)
  if (classData === null) {
    return (
      <div className="space-y-6">
        <Title order={1} size="30px" lh="36px" fw={600}>Edit Class</Title>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Class not found</p>
        </div>
      </div>
    );
  }

  // Don't render form if classData is still undefined (loading state)
  if (!classData) {
    return (
      <div className="space-y-6">
        <Title order={1} size="30px" lh="36px" fw={600}>Edit Class</Title>
        <div className="flex justify-center p-8">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portal/classes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <Title order={1} size="30px" lh="36px" fw={600}>
            Edit Class
          </Title>
        </div>
        <Group gap="sm">
          <Button
            variant="outline"
            color="red"
            onClick={handleDelete}
            disabled={updateClassMutation.isPending}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateClassMutation.isPending || !isFormValid()}
            loading={updateClassMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </Group>
      </div>

      <Card>
        <Card.Section className="p-6">
          <Title order={3} mb="md">Class Details</Title>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration (min)</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ClassRow
                classData={formData}
                onUpdate={handleFieldUpdate}
                onRemove={() => {}} // No remove in edit mode
                canRemove={false}
                disabled={updateClassMutation.isPending}
              />
            </TableBody>
          </Table>
        </Card.Section>
      </Card>
    </div>
  );
};

export default EditClass;
