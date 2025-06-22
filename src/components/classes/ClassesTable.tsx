
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

interface ClassesTableProps {
  classes: ClassSchedule[];
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
  const queryKey = ['classes', franchiseeId, locationId ?? 'all', search ?? ''] as const;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Debug: Log table rows
  console.log('Table rows', classes.length);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('class_schedules')
        .delete()
        .eq('id', id)
        .select();           // return deleted row for visibility

      console.log('DELETE-resp', { data, error });
      if (error) throw error;
      return id;
    },
    onMutate: async (deletedId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousClasses = queryClient.getQueryData<ClassSchedule[]>(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData<ClassSchedule[]>(queryKey, (old) => {
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
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClasses.map((classSchedule) => {
                // Safe access to nested data
                const cls = classSchedule.classes;
                const location = cls?.locations;
                
                return (
                  <TableRow key={classSchedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cls?.name ?? '—'}</div>
                        <div className="text-sm text-muted-foreground">
                          {cls?.class_name ?? '—'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {daysOfWeek[classSchedule.day_of_week]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {classSchedule.start_time} - {classSchedule.end_time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div>{location?.name ?? '—'}</div>
                          <div className="text-muted-foreground">
                            {location?.city ?? '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {classSchedule.current_bookings || 0} / {cls?.max_capacity ?? 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={classSchedule.is_active ? "default" : "secondary"}>
                        {classSchedule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TableRowMenu
                        onEdit={() => handleEditClass(classSchedule.id)}
                        onDelete={() => handleDeleteClass(classSchedule.id)}
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
