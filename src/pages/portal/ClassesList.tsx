import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { Plus, Calendar, Users, MapPin, Clock, BookOpen, Trash, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Title, SimpleGrid, Stack, Group } from '@mantine/core';
import { StickyHeader } from '@/components/mantine';
import { MetricCard } from '@/components/mantine/MetricCard';
import { PortalShell } from '@/layout/PortalShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClassSchedules } from '@/hooks/useClassSchedules';
import { useDeleteClassSchedule } from '@/hooks/useDeleteClassSchedule';
import { formatTimeInTimezone } from '@/utils/timezoneUtils';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ClassesListProps {
  franchiseeId?: string;
}

const ClassesList: React.FC<ClassesListProps> = ({ franchiseeId }) => {
  const navigate = useNavigate();
  const { data: settings } = useFranchiseeSettings();
  const timezone = settings?.timezone || 'America/New_York';

  const { data: classSchedules, isLoading } = useClassSchedules(franchiseeId);
  const deleteClassSchedule = useDeleteClassSchedule();

  const totalClasses = classSchedules?.length || 0;
  const totalLocations = [...new Set(classSchedules?.map(cs => cs.classes.locations.id))].length || 0;
  const totalParticipants = classSchedules?.reduce((acc, cs) => acc + cs.current_bookings, 0) || 0;

  const handleEditClass = (classScheduleId: string) => {
    navigate(`/portal/classes/edit/${classScheduleId}`);
  };

  const handleDeleteClass = async (classScheduleId: string) => {
    try {
      await deleteClassSchedule.mutateAsync(classScheduleId);
      toast.success("Class schedule deleted successfully!");
    } catch (error) {
      console.error("Error deleting class schedule:", error);
      toast.error("Failed to delete class schedule.");
    }
  };

  if (isLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </Stack>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Stack h="100vh" gap={0}>
        {/* Sticky Header with Metrics */}
        <StickyHeader>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={1} size="30px" lh="36px" fw={600}>
                Classes
              </Title>
              <Button onClick={() => navigate('/portal/classes/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              <MetricCard
                label="Total Classes"
                value={totalClasses}
                icon={BookOpen}
                description="All active classes"
              />
              <MetricCard
                label="Total Locations"
                value={totalLocations}
                icon={MapPin}
                description="Across all classes"
              />
              <MetricCard
                label="Total Participants"
                value={totalParticipants}
                icon={Users}
                description="Currently booked"
              />
              <MetricCard
                label="Avg. Participants/Class"
                value={totalClasses > 0 ? Math.round(totalParticipants / totalClasses) : 0}
                icon={Calendar}
                description="Booked per class"
              />
            </SimpleGrid>
          </Stack>
        </StickyHeader>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {classSchedules && classSchedules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {classSchedules.map((schedule) => (
                <Card key={schedule.id} className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{schedule.classes.class_name}</CardTitle>
                    <Badge variant="secondary">
                      {schedule.classes.locations.name}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(schedule.date_start || '').toLocaleDateString()} - {new Date(schedule.date_end || '').toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTimeInTimezone(schedule.start_time, timezone)} - {formatTimeInTimezone(schedule.end_time, timezone)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {schedule.classes.locations.city}, {schedule.classes.locations.state}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {schedule.current_bookings} / {schedule.classes.max_capacity}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClass(schedule.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this class schedule and all of its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteClass(schedule.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-md border border-dashed border-gray-300">
              <CardContent className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-lg font-semibold">No Classes Yet</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Get started by creating your first class schedule.
                  </p>
                  <Button onClick={() => navigate('/portal/classes/add')} className="mt-4">
                    Add Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Stack>
    </PortalShell>
  );
};

export default ClassesList;
