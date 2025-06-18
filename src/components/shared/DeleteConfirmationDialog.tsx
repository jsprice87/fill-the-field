
import React from 'react';
import { ConfirmModal } from '@/components/mantine/ConfirmModal';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false
}) => {
  const handleClose = () => onOpenChange(false);

  return (
    <ConfirmModal
      opened={open}
      onClose={handleClose}
      onConfirm={onConfirm}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          {title}
        </div>
      }
      message={description}
      confirmLabel={isLoading ? 'Deleting...' : 'Delete'}
      cancelLabel="Cancel"
      loading={isLoading}
      destructive={true}
    />
  );
};

export default DeleteConfirmationDialog;
