
import React from 'react';
import { MoreVertical, Phone, Edit, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          disabled={isLoading}
          aria-label="Actions menu"
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onCall && phone && (
          <DropdownMenuItem onSelect={() => onCall(phone)}>
            <Phone className="h-4 w-4 mr-2" />
            Call
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onSelect={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {(onCall && phone) || onEdit ? <DropdownMenuSeparator /> : null}
        {onArchiveToggle && (
          <DropdownMenuItem onSelect={onArchiveToggle}>
            <Archive className="h-4 w-4 mr-2" />
            {isArchived ? 'Unarchive' : 'Archive'}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onSelect={onDelete} className="text-red-600 focus:text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
