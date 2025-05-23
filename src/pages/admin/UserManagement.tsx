
import React, { useState, useMemo } from 'react';
import { useAdminFranchisees } from '@/hooks/useAdminFranchisees';
import { FranchiseesTable } from '@/components/admin/FranchiseesTable';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { UserManagementFilters } from '@/components/admin/UserManagementFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    console.log('Deleting user:', franchisee);
    toast.info('Delete functionality coming soon!');
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

  if (error) {
    console.error('Error loading franchisees:', error);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading franchisees: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all franchisees and their accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Franchisees ({filteredFranchisees.length})</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading franchisees...' : `Showing ${filteredFranchisees.length} of ${franchisees.length} franchisees`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading franchisees...</div>
            </div>
          ) : (
            <FranchiseesTable
              franchisees={filteredFranchisees}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </CardContent>
      </Card>

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        franchisee={selectedUser}
      />
    </div>
  );
};

export default AdminUserManagement;
