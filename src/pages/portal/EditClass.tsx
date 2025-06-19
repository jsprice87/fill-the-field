import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { ChevronLeft, Save, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Title, Stack, Group } from '@mantine/core';
import { StickyHeader } from '@/components/mantine';
import { PortalShell } from '@/layout/PortalShell';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ScheduleRow from '@/components/classes/ScheduleRow';
import { useClassScheduleById } from '@/hooks/useClassScheduleById';
import { useUpdateClassSchedule } from '@/hooks/useUpdateClassSchedule';
import { useDeleteClassSchedule } from '@/hooks/useDeleteClassSchedule';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useLocations } from '@/hooks/useLocations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { ScheduleRow as ScheduleRowType } from './Classes';

const EditClass: React.FC = () => {
  const { classScheduleId } = useParams<{ classScheduleId: string }>();
  const navigate = useNavigate();
  const [scheduleRows, setScheduleRows] = useState<ScheduleRowType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: classSchedule, isLoading: isClassScheduleLoading } = useClassScheduleById(classScheduleId);
  const updateClassSchedule = useUpdateClassSchedule();
  const deleteClassSchedule = useDeleteClassSchedule();

  const { data: franchiseeData } = useFranchiseeData();
  const { data: locations = [] } = useLocations(franchiseeData?.id);

  useEffect(() => {
    if (classSchedule) {
      const initialRow: ScheduleRowType = {
        id: classSchedule.id,
        className: classSchedule.classes.name,
        duration: classSchedule.classes.duration_minutes,
        timeStart: classSchedule.start_time,
        timeEnd: classSchedule.end_time,
        dateStart: classSchedule.date_start || '',
        dateEnd: classSchedule.date_end || '',
        overrideDates: [], // TODO: Load override dates
        minAge: classSchedule.classes.min_age,
        maxAge: classSchedule.classes.max_age,
        capacity: classSchedule.classes.max_capacity,
        dayOfWeek: classSchedule.day_of_week,
      };
      setScheduleRows([initialRow]);
    }
  }, [classSchedule]);

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleRowChange = (index: number, field: keyof ScheduleRowType, value: any) => {
    const updatedRows = [...scheduleRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    
    // Auto-calculate end time when start time or duration changes
    if (field === 'timeStart' || field === 'duration') {
      const startTime = field === 'timeStart' ? value : updatedRows[index].timeStart;
      const duration = field === 'duration' ? value : updatedRows[index].duration;
      updatedRows[index].timeEnd = calculateEndTime(startTime, duration);
    }
    
    setScheduleRows(updatedRows);
  };

  const handleSave = async () => {
    if (!classScheduleId) {
      toast.error("Class Schedule ID is missing");
      return;
    }

    if (scheduleRows.length === 0) {
      toast.error("No schedule rows to save");
      return;
    }

    const row = scheduleRows[0];

    if (!row.className.trim()) {
      toast.error("Please provide a class name");
      return;
    }

    setIsLoading(true);

    try {
      // Update class details
      const { error: classError } = await updateClassSchedule.mutateAsync({
        classScheduleId: classScheduleId,
        classData: {
          name: row.className,
          class_name: row.className,
          duration_minutes: row.duration,
          max_capacity: row.capacity,
          min_age: row.minAge,
          max_age: row.maxAge,
        },
        scheduleData: {
          start_time: row.timeStart,
          end_time: row.timeEnd,
          date_start: row.dateStart || null,
          date_end: row.dateEnd || null,
          day_of_week: row.dayOfWeek,
        },
        overrideDates: row.overrideDates,
      });

      if (classError) {
        console.error("Error updating class:", classError);
        toast.error("Failed to update class. Please try again.");
        return;
      }

      toast.success("Class updated successfully!");
      navigate(`/${franchiseeData?.slug}/portal/classes/list`);
    } catch (error) {
      console.error("Error during save:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      if (!classScheduleId) {
        toast.error("Class Schedule ID is missing");
        return;
      }

      const { error: deleteError } = await deleteClassSchedule.mutateAsync(classScheduleId);

      if (deleteError) {
        console.error("Error deleting class:", deleteError);
        toast.error("Failed to delete class. Please try again.");
        return;
      }

      toast.success("Class deleted successfully!");
      navigate(`/${franchiseeData?.slug}/portal/classes/list`);
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteOpen(false);
    }
  };

  if (isClassScheduleLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </Stack>
      </PortalShell>
    );
  }

  if (!classSchedule) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <p className="text-lg">Class not found.</p>
        </Stack>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Stack h="100vh" gap={0}>
        <StickyHeader>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={1} size="30px" lh="36px" fw={600}>
                Edit Class
              </Title>
              <Group gap="md">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </Group>
            </Group>
          </Stack>
        </StickyHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Day of Week</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleRows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.className}</TableCell>
                <TableCell>{row.duration} minutes</TableCell>
                <TableCell>{row.timeStart}</TableCell>
                <TableCell>{row.timeEnd}</TableCell>
                <TableCell>{row.dayOfWeek}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete Class
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this class and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Stack>
    </PortalShell>
  );
};

export default EditClass;
