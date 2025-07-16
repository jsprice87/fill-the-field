import React, { useState } from 'react';
import { ScrollArea, Switch, Text, rem, Table, Select, Button } from '@mantine/core';
import { MoreVertical, Edit, Archive, ArchiveRestore, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/mantine/Table';
import { TableRowMenu } from '@/components/ui/TableRowMenu';
import { 
  useArchiveLocation, 
  useUnarchiveLocation, 
  useDeleteLocation, 
  useToggleLocationStatus,
  useBulkArchiveLocations,
  useBulkUnarchiveLocations,
  useBulkDeleteLocations,
  useBulkToggleLocationStatus
} from '@/hooks/useLocationActions';
import { LocationProps } from './LocationCard';
import { EnhancedPagination } from '@/components/common/EnhancedPagination';
import { usePagination } from '@/hooks/usePagination';

interface LocationsTableProps {
  locations: LocationProps[];
  hideInactive?: boolean;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ 
  locations, 
  hideInactive = false 
}) => {
  const navigate = useNavigate();
  const archiveLocation = useArchiveLocation();
  const unarchiveLocation = useUnarchiveLocation();
  const deleteLocation = useDeleteLocation();
  const toggleStatus = useToggleLocationStatus();
  
  // Bulk action hooks
  const bulkArchiveLocations = useBulkArchiveLocations();
  const bulkUnarchiveLocations = useBulkUnarchiveLocations();
  const bulkDeleteLocations = useBulkDeleteLocations();
  const bulkToggleStatus = useBulkToggleLocationStatus();
  
  // Selection state
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  // Add pagination
  const pagination = usePagination({
    data: locations,
    initialPageSize: 25, // Start with 25 items per page for locations
    initialPage: 1
  });

  const handleArchiveToggle = async (locationId: string, isArchived: boolean) => {
    if (isArchived) {
      await unarchiveLocation.mutateAsync(locationId);
    } else {
      await archiveLocation.mutateAsync(locationId);
    }
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this location? This action cannot be undone.')) {
      return;
    }
    await deleteLocation.mutateAsync(locationId);
  };

  const handleStatusToggle = (locationId: string, newStatus: boolean) => {
    toggleStatus.mutate({ locationId, isActive: newStatus });
  };

  const handleAddClasses = (locationId: string) => {
    navigate(`classes/add?location=${locationId}`);
  };

  // Bulk action handlers
  const handleLocationSelection = (locationId: string, selected: boolean) => {
    const newSelection = new Set(selectedLocations);
    if (selected) {
      newSelection.add(locationId);
    } else {
      newSelection.delete(locationId);
    }
    setSelectedLocations(newSelection);
  };

  const handleSelectAll = () => {
    // Only select visible locations (not archived ones when hideInactive is true)
    const visibleLocations = hideInactive ? 
      locations.filter(location => location.is_active !== false) : 
      locations;
    
    if (selectedLocations.size === visibleLocations.length) {
      setSelectedLocations(new Set());
    } else {
      setSelectedLocations(new Set(visibleLocations.map(location => location.id)));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedLocations.size === 0) return;
    
    const selectedCount = selectedLocations.size;
    const selectedIds = Array.from(selectedLocations);
    
    // Immediately clear selection for instant feedback
    setSelectedLocations(new Set());
    
    try {
      if (hideInactive) {
        await bulkUnarchiveLocations.mutateAsync(selectedIds);
      } else {
        await bulkArchiveLocations.mutateAsync(selectedIds);
      }
    } catch (error) {
      console.error('Error in bulk archive operation:', error);
      // Re-select locations on error
      setSelectedLocations(new Set(selectedIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLocations.size === 0) return;
    
    const selectedCount = selectedLocations.size;
    const selectedIds = Array.from(selectedLocations);
    
    const confirmMessage = `Are you sure you want to permanently delete ${selectedCount} location${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Immediately clear selection for instant feedback
    setSelectedLocations(new Set());
    
    try {
      await bulkDeleteLocations.mutateAsync(selectedIds);
    } catch (error) {
      console.error('Error in bulk delete operation:', error);
      // Re-select locations on error
      setSelectedLocations(new Set(selectedIds));
    }
  };

  const handleBulkToggleStatus = async (isActive: boolean) => {
    if (selectedLocations.size === 0) return;
    
    const selectedIds = Array.from(selectedLocations);
    
    // Immediately clear selection for instant feedback
    setSelectedLocations(new Set());
    
    try {
      await bulkToggleStatus.mutateAsync({ locationIds: selectedIds, isActive });
    } catch (error) {
      console.error('Error in bulk status toggle:', error);
      // Re-select locations on error
      setSelectedLocations(new Set(selectedIds));
    }
  };

  if (!locations || locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Text size="sm" c="dimmed">
            {hideInactive ? 'No active locations found.' : 'No locations found. Add your first location to get started.'}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedLocations.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Text size="sm" fw={500}>
            {selectedLocations.size} location{selectedLocations.size > 1 ? 's' : ''} selected
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
            >
              {hideInactive ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
              {hideInactive ? 'Unarchive' : 'Archive'} Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              color="red"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <ScrollArea h="calc(100vh - 240px)" scrollbarSize={8} offsetScrollbars type="scroll">
        <Table.ScrollContainer minWidth={900}>
          <Table stickyHeader>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '48px' }}>
                  <input
                    type="checkbox"
                    checked={(() => {
                      const visibleLocations = hideInactive ? 
                        locations.filter(location => location.is_active !== false) : 
                        locations;
                      return selectedLocations.size === visibleLocations.length && visibleLocations.length > 0;
                    })()}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {pagination.currentData.map((location) => {
              const isArchived = location.is_active === false;
              
              return (
                <TableRow 
                  key={location.id}
                  interactive
                  style={{
                    backgroundColor: selectedLocations.has(location.id) ? 'var(--mantine-color-primary-1)' : 
                                    hoveredRow === location.id ? 'var(--mantine-color-gray-1)' : 'transparent',
                    opacity: isArchived ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredRow(location.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedLocations.has(location.id)}
                      onChange={(e) => handleLocationSelection(location.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <Text fw={500} size="sm">
                        {location.name}
                      </Text>
                      {location.phone && (
                        <Text size="xs" c="dimmed">
                          {location.phone}
                        </Text>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Text size="sm">
                      {location.address}
                    </Text>
                  </TableCell>
                  
                  <TableCell>
                    <Text size="sm">
                      {location.city}, {location.state} {location.zip}
                    </Text>
                  </TableCell>
                  
                  <TableCell>
                    <Switch
                      checked={location.is_active ?? true}
                      onChange={(event) => handleStatusToggle(location.id, event.currentTarget.checked)}
                      color="soccerGreen"
                      size="sm"
                      disabled={toggleStatus.isPending}
                      aria-label={`Toggle ${location.name} status`}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Text size="sm" c="dimmed">
                      {location.class_count || 0} {location.class_count === 1 ? 'class' : 'classes'}
                    </Text>
                  </TableCell>
                  
                  <TableCell>
                    <TableRowMenu
                      onEdit={() => navigate(`${location.id}`)}
                      onAddClasses={() => handleAddClasses(location.id)}
                      onArchiveToggle={() => handleArchiveToggle(location.id, isArchived)}
                      onDelete={() => handleDelete(location.id)}
                      isArchived={isArchived}
                      isLoading={archiveLocation.isPending || unarchiveLocation.isPending || deleteLocation.isPending}
                      editLabel="View Details"
                      addClassesLabel="Add Classes"
                      deleteLabel="Delete Location"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Table.ScrollContainer>
    </ScrollArea>
    
    {/* Enhanced Pagination */}
    <EnhancedPagination
      totalItems={pagination.totalItems}
      currentPage={pagination.currentPage}
      pageSize={pagination.pageSize}
      onPageChange={pagination.setCurrentPage}
      onPageSizeChange={pagination.setPageSize}
      pageSizeOptions={[10, 25, 50, 100]}
      itemName="locations"
      sticky={true}
    />
    </div>
  );
};

export default LocationsTable;
