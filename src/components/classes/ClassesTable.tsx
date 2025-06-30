
import React, { useState } from 'react';
import { ScrollArea, Table, Select, Button as MantineButton, Text } from '@mantine/core';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/mantine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@mantine/core';
import { Pagination } from '@/components/ui/pagination';
import { Clock, MapPin, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TableRowMenu } from '@/components/ui/TableRowMenu';
import { 
  useDeleteClass, 
  useArchiveClass, 
  useUnarchiveClass,
  useBulkArchiveClasses,
  useBulkUnarchiveClasses,
  useBulkDeleteClasses,
  useBulkToggleClassStatus
} from '@/hooks/useClassActions';

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
  showArchived?: boolean;
}

const ITEMS_PER_PAGE = 10;

const ClassesTable: React.FC<ClassesTableProps> = ({ 
  classes, 
  onDelete, 
  franchiseeId, 
  locationId, 
  search,
  showArchived = false
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Individual action hooks
  const deleteClass = useDeleteClass();
  const archiveClass = useArchiveClass();
  const unarchiveClass = useUnarchiveClass();
  
  // Bulk action hooks
  const bulkArchiveClasses = useBulkArchiveClasses();
  const bulkUnarchiveClasses = useBulkUnarchiveClasses();
  const bulkDeleteClasses = useBulkDeleteClasses();
  const bulkToggleStatus = useBulkToggleClassStatus();
  
  // Selection state
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Construct the exact query key as used in useClasses
  const queryKey = ['classes', franchiseeId, locationId ?? 'ALL', search ?? ''] as const;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Debug: Log table rows
  console.log('Table rows', classes.length);

  // Bulk action handlers
  const handleClassSelection = (classId: string, selected: boolean) => {
    const newSelection = new Set(selectedClasses);
    if (selected) {
      newSelection.add(classId);
    } else {
      newSelection.delete(classId);
    }
    setSelectedClasses(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedClasses.size === classes.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(classes.map(cls => cls.id)));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedClasses.size === 0) return;
    
    const selectedIds = Array.from(selectedClasses);
    
    // Immediately clear selection for instant feedback
    setSelectedClasses(new Set());
    
    try {
      if (showArchived) {
        await bulkUnarchiveClasses.mutateAsync(selectedIds);
      } else {
        await bulkArchiveClasses.mutateAsync(selectedIds);
      }
    } catch (error) {
      console.error('Error in bulk archive operation:', error);
      // Re-select classes on error
      setSelectedClasses(new Set(selectedIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClasses.size === 0) return;
    
    const selectedCount = selectedClasses.size;
    const selectedIds = Array.from(selectedClasses);
    
    const confirmMessage = `Are you sure you want to permanently delete ${selectedCount} class${selectedCount > 1 ? 'es' : ''}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Immediately clear selection for instant feedback
    setSelectedClasses(new Set());
    
    try {
      await bulkDeleteClasses.mutateAsync(selectedIds);
    } catch (error) {
      console.error('Error in bulk delete operation:', error);
      // Re-select classes on error
      setSelectedClasses(new Set(selectedIds));
    }
  };

  const handleBulkToggleStatus = async (isActive: boolean) => {
    if (selectedClasses.size === 0) return;
    
    const selectedIds = Array.from(selectedClasses);
    
    // Immediately clear selection for instant feedback
    setSelectedClasses(new Set());
    
    try {
      await bulkToggleStatus.mutateAsync({ classIds: selectedIds, isActive });
    } catch (error) {
      console.error('Error in bulk status toggle:', error);
      // Re-select classes on error
      setSelectedClasses(new Set(selectedIds));
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this class? This action cannot be undone.')) {
      return;
    }
    deleteClass.mutate(id);
  };

  const handleArchiveToggle = async (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return;

    if (classData.is_active) {
      await archiveClass.mutateAsync(classId);
    } else {
      await unarchiveClass.mutateAsync(classId);
    }
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
    <div className="w-full space-y-4">
      {selectedClasses.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Text size="sm" fw={500}>
            {selectedClasses.size} class{selectedClasses.size > 1 ? 'es' : ''} selected
          </Text>
          <div className="flex gap-2 items-center">
            <Select
              placeholder="Change status..."
              data={[
                { value: 'activate', label: 'Activate' },
                { value: 'deactivate', label: 'Deactivate' }
              ]}
              size="sm"
              w={150}
              withinPortal
              clearable
              onChange={(value) => {
                if (value === 'activate') {
                  handleBulkToggleStatus(true);
                } else if (value === 'deactivate') {
                  handleBulkToggleStatus(false);
                }
              }}
            />
            <MantineButton
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
            >
              {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
              {showArchived ? 'Unarchive' : 'Archive'} Selected
            </MantineButton>
            <MantineButton
              variant="outline"
              size="sm"
              color="red"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </MantineButton>
          </div>
        </div>
      )}

      <ScrollArea h="calc(100vh - 240px)">
        <Table.ScrollContainer w="100%" minWidth={900}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '48px' }}>
                  <input
                    type="checkbox"
                    checked={selectedClasses.size === classes.length && classes.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </TableHead>
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
                  <TableRow 
                    key={classData.id}
                    style={{
                      backgroundColor: selectedClasses.has(classData.id) ? 'var(--mantine-color-primary-1)' : 
                                      hoveredRow === classData.id ? 'var(--mantine-color-gray-1)' : 'transparent',
                      opacity: !classData.is_active ? 0.6 : 1
                    }}
                    onMouseEnter={() => setHoveredRow(classData.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedClasses.has(classData.id)}
                        onChange={(e) => handleClassSelection(classData.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{classData.name}</div>
                        {classData.class_name && classData.class_name !== classData.name && (
                          <div className="text-sm text-muted-foreground">
                            {classData.class_name}
                          </div>
                        )}
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
                        onArchiveToggle={() => handleArchiveToggle(classData.id)}
                        onDelete={() => handleDeleteClass(classData.id)}
                        isArchived={!classData.is_active}
                        isLoading={deleteClass.isPending || archiveClass.isPending || unarchiveClass.isPending}
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
