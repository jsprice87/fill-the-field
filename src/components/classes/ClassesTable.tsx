
import React, { useState } from 'react';
import { ScrollArea, Table } from '@mantine/core';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/mantine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@mantine/core';
import { Pagination } from '@/components/ui/pagination';
import { Edit, Trash, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
}

const ITEMS_PER_PAGE = 10;

const ClassesTable: React.FC<ClassesTableProps> = ({ classes, onDelete }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    setIsDeleting(id);
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
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    } finally {
      setIsDeleting(null);
    }
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
              {paginatedClasses.map((classSchedule) => (
                <TableRow key={classSchedule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{classSchedule.classes.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {classSchedule.classes.class_name}
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
                        <div>{classSchedule.classes.locations.name}</div>
                        <div className="text-muted-foreground">
                          {classSchedule.classes.locations.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {classSchedule.current_bookings || 0} / {classSchedule.classes.max_capacity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={classSchedule.is_active ? "default" : "secondary"}>
                      {classSchedule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/portal/classes/edit/${classSchedule.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteClass(classSchedule.id)}
                        disabled={isDeleting === classSchedule.id}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
