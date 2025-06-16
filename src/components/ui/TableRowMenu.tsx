
import React from 'react';
import { MoreVertical, Phone, Edit, Archive, Trash2 } from 'lucide-react';
import { ActionIcon, Menu } from '@mantine/core';

interface TableRowMenuProps {
  onCall?: (phone: string) => void;
  onEdit?: () => void;
  onArchiveToggle?: () => void;
  onDelete?: () => void;
  phone?: string;
  isArchived?: boolean;
  isLoading?: boolean;
  editLabel?: string;
  deleteLabel?: string;
}

export const TableRowMenu: React.FC<TableRowMenuProps> = ({
  onCall,
  onEdit,
  onArchiveToggle,
  onDelete,
  phone,
  isArchived = false,
  isLoading = false,
  editLabel = "Edit",
  deleteLabel = "Delete"
}) => {
  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon 
          variant="subtle" 
          size="sm"
          disabled={isLoading}
          aria-label="Actions menu"
        >
          <MoreVertical size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {onCall && phone && (
          <Menu.Item
            leftSection={<Phone size={16} />}
            onClick={() => onCall(phone)}
          >
            Call
          </Menu.Item>
        )}
        {onEdit && (
          <Menu.Item
            leftSection={<Edit size={16} />}
            onClick={onEdit}
          >
            {editLabel}
          </Menu.Item>
        )}
        {((onCall && phone) || onEdit) && <Menu.Divider />}
        {onArchiveToggle && (
          <Menu.Item
            leftSection={<Archive size={16} />}
            onClick={onArchiveToggle}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </Menu.Item>
        )}
        {onDelete && (
          <Menu.Item
            leftSection={<Trash2 size={16} />}
            onClick={onDelete}
            color="red"
          >
            {deleteLabel}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
