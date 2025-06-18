
import React from 'react';
import { Stack, Text, Group, Badge } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { Button } from '@/components/mantine/Button';
import { Mail, Phone, MapPin, Building, Calendar, User } from 'lucide-react';

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

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchisee: Franchisee | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  franchisee,
}) => {
  if (!franchisee) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'premium': return 'blue';
      case 'pro': return 'purple';
      case 'free': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="User Details"
      size="lg"
    >
      <Stack gap="lg">
        {/* User Information */}
        <Stack gap="sm">
          <Text fw={600} size="lg">Account Information</Text>
          
          <Group gap="sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <Text size="sm">{franchisee.email}</Text>
          </Group>
          
          <Group gap="sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Text size="sm">Created: {formatDate(franchisee.created_at)}</Text>
          </Group>
          
          <Group gap="sm">
            <User className="h-4 w-4 text-gray-500" />
            <Text size="sm">ID: {franchisee.id}</Text>
          </Group>
        </Stack>

        {/* Franchisee Information */}
        <Stack gap="sm">
          <Text fw={600} size="lg">Franchisee Information</Text>
          
          <Group gap="sm">
            <Building className="h-4 w-4 text-gray-500" />
            <Text size="sm">{franchisee.company_name}</Text>
          </Group>
          
          <Group gap="sm">
            <User className="h-4 w-4 text-gray-500" />
            <Text size="sm">Contact: {franchisee.contact_name}</Text>
          </Group>
          
          {franchisee.phone && (
            <Group gap="sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <Text size="sm">{franchisee.phone}</Text>
            </Group>
          )}
          
          {(franchisee.city || franchisee.state) && (
            <Group gap="sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Text size="sm">
                {franchisee.city && franchisee.city}
                {franchisee.city && franchisee.state && ', '}
                {franchisee.state && franchisee.state}
              </Text>
            </Group>
          )}
          
          <Group gap="sm" mt="sm">
            {franchisee.subscription_tier && (
              <Badge color={getTierColor(franchisee.subscription_tier)}>
                {franchisee.subscription_tier.charAt(0).toUpperCase() + 
                 franchisee.subscription_tier.slice(1)} Plan
              </Badge>
            )}
            
            {franchisee.subscription_status && (
              <Badge color={getStatusColor(franchisee.subscription_status)}>
                {franchisee.subscription_status.charAt(0).toUpperCase() + 
                 franchisee.subscription_status.slice(1)}
              </Badge>
            )}
          </Group>
        </Stack>

        {/* Actions */}
        <Group justify="flex-end" mt="lg">
          <Button onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default UserDetailsModal;
