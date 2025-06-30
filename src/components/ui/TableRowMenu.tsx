
import React, { useState } from 'react';
import { Menu, ActionIcon } from '@mantine/core';
import { MoreVertical, Edit, Archive, ArchiveRestore, Trash2, Plus } from 'lucide-react';
import { ConfirmModal } from '@/components/mantine/ConfirmModal';

interface TableRowMenuProps {
  onEdit?: () => void;
  onArchiveToggle?: () => void;
  onDelete?: () => void;
  onAddClasses?: () => void;
  isArchived?: boolean;
  isLoading?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  archiveLabel?: string;
  unarchiveLabel?: string;
  addClassesLabel?: string;
}

export const TableRowMenu: React.FC<TableRowMenuProps> = ({
  onEdit,
  onArchiveToggle,
  onDelete,
  onAddClasses,
  isArchived = false,
  isLoading = false,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  archiveLabel = 'Archive',
  unarchiveLabel = 'Restore',
  addClassesLabel = 'Add Classes',
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.();
    setDeleteModalOpen(false);
  };

  return (
    <>
      <Menu shadow="md" width={180} position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="sm"
            disabled={isLoading}
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {onEdit && (
            <Menu.Item
              leftSection={<Edit className="h-4 w-4" />}
              onClick={onEdit}
              disabled={isLoading}
            >
              {editLabel}
            </Menu.Item>
          )}

          {onAddClasses && (
            <Menu.Item
              leftSection={<Plus className="h-4 w-4" />}
              onClick={onAddClasses}
              disabled={isLoading}
            >
              {addClassesLabel}
            </Menu.Item>
          )}

          {onArchiveToggle && (
            <Menu.Item
              leftSection={
                isArchived ? 
                  <ArchiveRestore className="h-4 w-4" /> : 
                  <Archive className="h-4 w-4" />
              }
              onClick={onArchiveToggle}
              disabled={isLoading}
            >
              {isArchived ? unarchiveLabel : archiveLabel}
            </Menu.Item>
          )}

          {onDelete && (
            <Menu.Item
              leftSection={<Trash2 className="h-4 w-4" />}
              onClick={handleDeleteClick}
              disabled={isLoading}
              color="red"
            >
              {deleteLabel}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      {onDelete && (
        <ConfirmModal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirm Deletion"
          message="Are you sure you want to permanently delete this item? This action cannot be undone."
          confirmLabel="Delete"
          destructive
          loading={isLoading}
        />
      )}
    </>
  );
};
