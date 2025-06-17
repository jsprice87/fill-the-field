
import React, { useState } from 'react';
import { ScrollArea, Switch, Text, rem } from '@mantine/core';
import { MoreVertical, Edit, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/mantine/Table';
import { TableRowMenu } from '@/components/ui/TableRowMenu';
import { useArchiveLocation, useUnarchiveLocation, useDeleteLocation, useToggleLocationStatus } from '@/hooks/useLocationActions';
import { LocationProps } from './LocationCard';

interface LocationsTableProps {
  locations: LocationProps[];
  onEdit: (locationId: string) => void;
  showArchived?: boolean;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ 
  locations, 
  onEdit, 
  showArchived = false 
}) => {
  const archiveLocation = useArchiveLocation();
  const unarchiveLocation = useUnarchiveLocation();
  const deleteLocation = useDeleteLocation();
  const toggleStatus = useToggleLocationStatus();

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

  if (!locations || locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Text size="sm" c="dimmed">
            {showArchived ? 'No archived locations found.' : 'No locations found. Add your first location to get started.'}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea
      scrollbarSize={8}
      offsetScrollbars
      type="scroll"
      h={`calc(100vh - ${rem(180)})`}
    >
      <Table stickyHeader>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => {
            const isArchived = location.is_active === false;
            
            return (
              <TableRow 
                key={location.id}
                interactive
                style={{ opacity: isArchived ? 0.6 : 1 }}
              >
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
                    0 classes
                  </Text>
                </TableCell>
                
                <TableCell>
                  <TableRowMenu
                    onEdit={() => onEdit(location.id)}
                    onArchiveToggle={() => handleArchiveToggle(location.id, isArchived)}
                    onDelete={() => handleDelete(location.id)}
                    isArchived={isArchived}
                    isLoading={archiveLocation.isPending || unarchiveLocation.isPending || deleteLocation.isPending}
                    editLabel="Edit Location"
                    deleteLabel="Delete Location"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default LocationsTable;
