
import React from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = false,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const transitionProps = prefersReducedMotion 
    ? { transition: 'fade', duration: 0 }
    : { transition: 'pop', duration: 200 };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      radius="lg"
      padding="xl"
      overlayProps={{ blur: 4 }}
      transitionProps={transitionProps}
      withinPortal
      trapFocus
      closeOnEscape={!loading}
      closeOnClickOutside={!loading}
      centered
    >
      <Text size="sm" mb="lg">
        {message}
      </Text>
      
      <Group justify="flex-end" gap="sm">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          color={destructive ? 'red' : undefined}
          onClick={onConfirm}
          loading={loading}
          data-autofocus
        >
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
};
