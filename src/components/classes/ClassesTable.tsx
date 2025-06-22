
import React, { useState } from 'react';
import { ScrollArea, Table } from '@mantine/core';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/mantine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@mantine/core';
import { Pagination } from '@/components/ui/pagination';
import { Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import { supabase } from '@/integrations/supabase/client';
import { TableRowMenu } from '@/components/ui/TableRowMenu';

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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  locations: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  class_schedules: Array<{
    id: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
    date_start: string | null;
    date_end: string | null;
    current_bookings: number;
    is_active: boolean;
  }>;
}

interface ClassesTableProps {
  classes: ClassData[];
  onDelete?: (id: string) => void;
  franchiseeId?: string;
  locationId?: string;
  search?: string;
}

const ITEMS_PER_PAGE = 10;

const ClassesTable: React.FC<ClassesTableProps> = ({ 
  classes, 
  onDelete, 
  franchiseeId, 
  locationId, 
  search 
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Construct the exact query key as used in useClasses
  const queryKey = ['classes', franchiseeId, locationId ?? 'ALL', search ?? ''] as const;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Debug: Log table rows
  console.log('Table rows', classes.length);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)
        .select();

      console.log('DELETE-resp', { data, error });
      if (error) throw error;
      return id;
    },
    onMutate: async (deletedId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousClasses = queryClient.getQueryData<ClassData[]>(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData<ClassData[]>(queryKey, (old) => {
        if (!old) return [];
        return old.filter(cls => cls.id !== deletedId);
      });

      return { previousClasses };
    },
    onError: (error: any, deletedId: string, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousClasses) {
        queryClient.setQueryData(queryKey, context.previousClasses);
      }
      
      showNotification({
        color: 'red',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete class'
      });
      
      console.error('Delete class error:', error);
    },
    onSuccess: (deletedId: string) => {
      showNotification({
        color: 'green',
        title: 'Success',
        message: 'Class deleted successfully'
      });
      
      if (onDelete) {
        onDelete(deletedId);
      }
    },
    onSettled: () => {
      // Debug: Check cache after delete
      console.log('Cache after delete', queryClient.getQueryData(queryKey));
      
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleDeleteClass = async (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditClass = (id: string) => {
    console.log('Edit click id', id);
    navigate(`/portal/classes/edit/${id}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(classes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClasses = classes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (classes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No classes found.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ScrollArea h="calc(100vh - 240px)">
        <Table.ScrollContainer w="100%" minWidth={900}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClasses.map((classData, index) => {
                // Log first row model to inspect structure
                if (index === 0) {
                  console.log('row model', classData);
                }
                
                // Get first active schedule for display
                const activeSchedule = classData.class_schedules?.find(s => s.is_active) || classData.class_schedules?.[0];
                
                return (
                  <TableRow key={classData.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{classData.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {classData.class_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeSchedule ? (
                        <div>
                          <Badge variant="secondary">
                            {daysOfWeek[activeSchedule.day_of_week]}
                          </Badge>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {activeSchedule.start_time} - {activeSchedule.end_time}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No schedule</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div>{classData.locations?.name ?? '—'}</div>
                          <div className="text-muted-foreground">
                            {classData.locations?.city ?? '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {activeSchedule?.current_bookings || 0} / {classData.max_capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {classData.min_age}-{classData.max_age} years
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={classData.is_active ? "default" : "secondary"}>
                        {classData.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TableRowMenu
                        onEdit={() => handleEditClass(classData.id)}
                        onDelete={() => handleDeleteClass(classData.id)}
                        isLoading={deleteMutation.isPending}
                        editLabel="Edit Class"
                        deleteLabel="Delete Class"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Table.ScrollContainer>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ClassesTable;
