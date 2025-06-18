
import React, { useState, useMemo } from 'react';
import { useAdminFranchisees } from '@/hooks/useAdminFranchisees';
import { UserManagementFilters } from '@/components/admin/UserManagementFilters';
import { PortalShell } from '@/layout/PortalShell';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Button,
  Badge,
  ActionIcon,
  Menu
} from '@mantine/core';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/mantine/Table';
import { Modal } from '@/components/mantine/Modal';
import { ConfirmModal } from '@/components/mantine/ConfirmModal';
import { MoreVertical, Eye, Edit, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Franchisee {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
  slug: string | null;
  city: string | null;
  state: string | null;
}

const AdminUserManagement: React.FC = () => {
  const { data: franchisees = [], isLoading, error, refetch } = useAdminFranchisees();
  const [selectedUser, setSelectedUser] = useState<Franchisee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Franchisee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  console.log('UserManagement render:', { franchisees, isLoading, error });

  const filteredFranchisees = useMemo(() => {
    return franchisees.filter((franchisee) => {
      const matchesSearch = 
        franchisee.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchisee.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchisee.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || franchisee.subscription_status === statusFilter;
      const matchesTier = tierFilter === 'all' || franchisee.subscription_tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [franchisees, searchTerm, statusFilter, tierFilter]);

  const handleViewUser = (franchisee: Franchisee) => {
    console.log('Viewing user:', franchisee);
    setSelectedUser(franchisee);
    setIsModalOpen(true);
  };

  const handleEditUser = (franchisee: Franchisee) => {
    console.log('Editing user:', franchisee);
    toast.info('Edit functionality coming soon!');
  };

  const handleDeleteUser = (franchisee: Franchisee) => {
    setUserToDelete(franchisee);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      console.log('Deleting user:', userToDelete);
      toast.info('Delete functionality coming soon!');
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleExport = () => {
    console.log('Exporting data...');
    const csvContent = [
      ['Company Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Tier', 'Joined'].join(','),
      ...filteredFranchisees.map(f => [
        f.company_name,
        f.contact_name,
        f.email,
        f.phone || '',
        f.subscription_status || '',
        f.subscription_tier || '',
        new Date(f.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'franchisees-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  if (error) {
    console.error('Error loading franchisees:', error);
    return (
      <PortalShell>
        <Container size="xl" py="lg">
          <Paper p="xl" withBorder>
            <Text c="red.6">Error loading franchisees: {error.message}</Text>
          </Paper>
        </Container>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Container size="xl" py="lg">
        <Stack gap="lg">
          <Group justify="space-between">
            <div>
              <Title order={1}>User Management</Title>
              <Text c="dimmed">
                Manage all franchisees and their accounts
              </Text>
            </div>
          </Group>

          <Paper p="xl" withBorder>
            <Stack gap="lg">
              <Group justify="space-between">
                <Title order={2}>Franchisees ({filteredFranchisees.length})</Title>
                <Button 
                  leftSection={<Download size={16} />}
                  variant="outline"
                  onClick={handleExport}
                >
                  Export
                </Button>
              </Group>

              <UserManagementFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                tierFilter={tierFilter}
                onTierFilterChange={setTierFilter}
                onRefresh={() => refetch()}
                onExport={handleExport}
              />

              {isLoading ? (
                <Text ta="center" py="xl" c="dimmed">Loading franchisees...</Text>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFranchisees.map((franchisee) => (
                      <TableRow key={franchisee.id}>
                        <TableCell>
                          <Text fw={500}>{franchisee.company_name}</Text>
                          {franchisee.city && franchisee.state && (
                            <Text size="sm" c="dimmed">
                              {franchisee.city}, {franchisee.state}
                            </Text>
                          )}
                        </TableCell>
                        <TableCell>{franchisee.contact_name}</TableCell>
                        <TableCell>{franchisee.email}</TableCell>
                        <TableCell>
                          <Badge color={getStatusColor(franchisee.subscription_status)} variant="light">
                            {franchisee.subscription_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {franchisee.subscription_tier || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(franchisee.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle" size="sm">
                                <MoreVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<Eye size={14} />}
                                onClick={() => handleViewUser(franchisee)}
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<Edit size={14} />}
                                onClick={() => handleEditUser(franchisee)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<Trash2 size={14} />}
                                onClick={() => handleDeleteUser(franchisee)}
                                color="red"
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          </Paper>
        </Stack>

        {/* User Details Modal */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Franchisee Details"
          size="lg"
        >
          {selectedUser && (
            <Stack gap="md">
              <Group>
                <Text fw={500}>Company:</Text>
                <Text>{selectedUser.company_name}</Text>
              </Group>
              <Group>
                <Text fw={500}>Contact:</Text>
                <Text>{selectedUser.contact_name}</Text>
              </Group>
              <Group>
                <Text fw={500}>Email:</Text>
                <Text>{selectedUser.email}</Text>
              </Group>
              <Group>
                <Text fw={500}>Phone:</Text>
                <Text>{selectedUser.phone || 'N/A'}</Text>
              </Group>
              <Group>
                <Text fw={500}>Status:</Text>
                <Badge color={getStatusColor(selectedUser.subscription_status)} variant="light">
                  {selectedUser.subscription_status || 'Unknown'}
                </Badge>
              </Group>
              <Group>
                <Text fw={500}>Tier:</Text>
                <Text>{selectedUser.subscription_tier || 'N/A'}</Text>
              </Group>
              <Group>
                <Text fw={500}>Joined:</Text>
                <Text>{new Date(selectedUser.created_at).toLocaleDateString()}</Text>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Franchisee"
          message={`Are you sure you want to delete ${userToDelete?.company_name}? This action cannot be undone.`}
          confirmLabel="Delete"
          destructive
        />
      </Container>
    </PortalShell>
  );
};

export default AdminUserManagement;
