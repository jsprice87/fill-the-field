import React, { useState, useMemo } from 'react';
import { useAdminFranchisees } from '@/hooks/useAdminFranchisees';
import { useResetUserPassword, useBulkUserActions } from '@/hooks/useAdminUserActions';
import { useImpersonation } from '@/hooks/useImpersonation';
import { UserManagementFilters } from '@/components/admin/UserManagementFilters';
import { UserEditModal } from '@/components/admin/UserEditModal';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import { UserDeleteConfirmation } from '@/components/admin/UserDeleteConfirmation';
import { UserCreateModal } from '@/components/admin/UserCreateModal';
import { testAdminPolicies } from '@/utils/debugMigration';
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
  Menu,
  ScrollArea,
  Table,
  Checkbox,
  Select,
  Loader
} from '@mantine/core';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/mantine/Table';
import { MoreVertical, Eye, Edit, Trash2, Download, Plus, Key, Users, UserCheck } from 'lucide-react';
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
  const resetPassword = useResetUserPassword();
  const { bulkDelete, bulkUpdateStatus } = useBulkUserActions();
  const { startImpersonation } = useImpersonation();
  
  const [selectedUser, setSelectedUser] = useState<Franchisee | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Franchisee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');

  console.log('UserManagement render:', { franchisees, isLoading, error });
  
  // Debug function to test admin policies
  const handleDebugTest = async () => {
    try {
      const result = await testAdminPolicies();
      console.log('Debug test result:', result);
    } catch (error) {
      console.error('Debug test error:', error);
    }
  };

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
    setSelectedUser(franchisee);
    setDetailsModalOpen(true);
  };

  const handleEditUser = (franchisee: Franchisee) => {
    setSelectedUser(franchisee);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (franchisee: Franchisee) => {
    setUserToDelete(franchisee);
    setDeleteModalOpen(true);
  };

  const handleResetPassword = async (user: Franchisee) => {
    try {
      await resetPassword.mutateAsync(user.email);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleImpersonateUser = async (user: Franchisee) => {
    try {
      await startImpersonation({
        id: user.id,
        name: user.contact_name,
        email: user.email,
        company: user.company_name
      });
      
      // Redirect to user's portal
      window.location.href = `/${user.slug}/portal/dashboard`;
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredFranchisees.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredFranchisees.map(f => f.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    const userIds = Array.from(selectedUsers);

    try {
      switch (bulkAction) {
        case 'delete':
          await bulkDelete.mutateAsync(userIds);
          break;
        case 'activate':
          await bulkUpdateStatus.mutateAsync({ userIds, status: 'active' });
          break;
        case 'deactivate':
          await bulkUpdateStatus.mutateAsync({ userIds, status: 'inactive' });
          break;
        case 'suspend':
          await bulkUpdateStatus.mutateAsync({ userIds, status: 'suspended' });
          break;
      }
      setSelectedUsers(new Set());
      setBulkAction('');
    } catch (error) {
      // Error handling is done in the hooks
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
      <Container size="xl" py="lg">
        <Paper p="xl" withBorder>
          <Text c="red.6">Error loading franchisees: {error.message}</Text>
        </Paper>
      </Container>
    );
  }

  const bulkActionOptions = [
    { value: '', label: 'Select bulk action...' },
    { value: 'activate', label: 'Activate Users' },
    { value: 'deactivate', label: 'Deactivate Users' },
    { value: 'suspend', label: 'Suspend Users' },
    { value: 'delete', label: 'Delete Users' },
  ];

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>User Management</Title>
            <Text c="dimmed">
              Manage all users and their accounts
            </Text>
          </div>
          <Group>
            <Button 
              variant="outline"
              onClick={handleDebugTest}
              color="blue"
            >
              Debug Test
            </Button>
            <Button 
              leftSection={<Plus size={16} />}
              onClick={() => setCreateModalOpen(true)}
            >
              Add User
            </Button>
          </Group>
        </Group>

        <Paper p="xl" withBorder>
          <Stack gap="lg">
            <Group justify="space-between">
              <Title order={2}>Users ({filteredFranchisees.length})</Title>
              <Group>
                {selectedUsers.size > 0 && (
                  <>
                    <Select
                      placeholder="Bulk actions"
                      data={bulkActionOptions}
                      value={bulkAction}
                      onChange={(value) => setBulkAction(value || '')}
                      w={180}
                    />
                    <Button
                      leftSection={<Users size={16} />}
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      loading={bulkDelete.isPending || bulkUpdateStatus.isPending}
                    >
                      Apply to {selectedUsers.size} users
                    </Button>
                  </>
                )}
                <Button 
                  leftSection={<Download size={16} />}
                  variant="outline"
                  onClick={handleExport}
                >
                  Export
                </Button>
              </Group>
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
              <Group justify="center" py="xl">
                <Loader size="md" />
                <Text c="dimmed">Loading users...</Text>
              </Group>
            ) : (
              <ScrollArea h="calc(100vh - 240px)">
                <Table.ScrollContainer minWidth={1000}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={selectedUsers.size === filteredFranchisees.length && filteredFranchisees.length > 0}
                            indeterminate={selectedUsers.size > 0 && selectedUsers.size < filteredFranchisees.length}
                            onChange={handleSelectAll}
                          />
                        </TableHead>
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
                            <Checkbox
                              checked={selectedUsers.has(franchisee.id)}
                              onChange={(event) => handleSelectUser(franchisee.id, event.currentTarget.checked)}
                            />
                          </TableCell>
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
                                  leftSection={<Key size={14} />}
                                  onClick={() => handleResetPassword(franchisee)}
                                  disabled={resetPassword.isPending}
                                >
                                  Reset Password
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<UserCheck size={14} />}
                                  onClick={() => handleImpersonateUser(franchisee)}
                                  disabled={!franchisee.slug}
                                >
                                  Impersonate User
                                </Menu.Item>
                                <Menu.Divider />
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
                  </Table.ScrollContainer>
                </ScrollArea>
              )}
            </Stack>
          </Paper>
        </Stack>

        {/* Modals */}
        <UserDetailsModal
          franchisee={selectedUser}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedUser(null);
          }}
        />

        <UserEditModal
          user={selectedUser}
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
        />

        <UserDeleteConfirmation
          user={userToDelete}
          opened={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }}
        />

        <UserCreateModal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      </Container>
    );
};

export default AdminUserManagement;
