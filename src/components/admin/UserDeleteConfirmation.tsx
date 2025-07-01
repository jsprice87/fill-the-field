import React from 'react';
import { Modal, Text, Group, Button, Stack, Alert, List } from '@mantine/core';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { useDeleteUser } from '@/hooks/useAdminUserActions';

interface User {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
}

interface UserDeleteConfirmationProps {
  user: User | null;
  opened: boolean;
  onClose: () => void;
}

export const UserDeleteConfirmation: React.FC<UserDeleteConfirmationProps> = ({
  user,
  opened,
  onClose,
}) => {
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUser.mutateAsync(user.id);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (!user) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete User Account"
      size="md"
    >
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Text fw={500} mb="xs">This action cannot be undone!</Text>
          <Text size="sm">
            Deleting this user will permanently remove all associated data from the system.
          </Text>
        </Alert>

        <Stack gap="xs">
          <Text fw={500}>User to be deleted:</Text>
          <Text size="sm" c="dimmed">
            <strong>Company:</strong> {user.company_name}
          </Text>
          <Text size="sm" c="dimmed">
            <strong>Contact:</strong> {user.contact_name}
          </Text>
          <Text size="sm" c="dimmed">
            <strong>Email:</strong> {user.email}
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text fw={500} c="red">The following data will be permanently deleted:</Text>
          <List size="sm" spacing="xs">
            <List.Item>User account and profile</List.Item>
            <List.Item>All bookings and reservations</List.Item>
            <List.Item>All leads and contact information</List.Item>
            <List.Item>All classes and programs</List.Item>
            <List.Item>All locations and venues</List.Item>
            <List.Item>All associated files and documents</List.Item>
          </List>
        </Stack>

        <Alert color="orange" variant="light">
          <Text size="sm">
            <strong>Alternative:</strong> Consider deactivating the user account instead of deleting it 
            to preserve historical data while preventing access.
          </Text>
        </Alert>

        <Group justify="flex-end" mt="lg">
          <Button variant="subtle" onClick={onClose} disabled={deleteUser.isPending}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleDelete}
            loading={deleteUser.isPending}
          >
            Delete User & All Data
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};