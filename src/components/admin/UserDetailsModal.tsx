
import React from 'react';
import { Stack, Text, Group, Badge } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { Button } from '@/components/mantine/Button';
import { Mail, Phone, MapPin, Building, Calendar, User } from 'lucide-react';

interface UserDetailsData {
  id: string;
  email: string;
  created_at: string;
  franchisee?: {
    company_name: string;
    contact_name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    subscription_tier?: string;
    subscription_status?: string;
  };
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserDetailsData | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  if (!userData) return null;

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
            <Text size="sm">{userData.email}</Text>
          </Group>
          
          <Group gap="sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Text size="sm">Created: {formatDate(userData.created_at)}</Text>
          </Group>
          
          <Group gap="sm">
            <User className="h-4 w-4 text-gray-500" />
            <Text size="sm">ID: {userData.id}</Text>
          </Group>
        </Stack>

        {/* Franchisee Information */}
        {userData.franchisee && (
          <Stack gap="sm">
            <Text fw={600} size="lg">Franchisee Information</Text>
            
            <Group gap="sm">
              <Building className="h-4 w-4 text-gray-500" />
              <Text size="sm">{userData.franchisee.company_name}</Text>
            </Group>
            
            <Group gap="sm">
              <User className="h-4 w-4 text-gray-500" />
              <Text size="sm">Contact: {userData.franchisee.contact_name}</Text>
            </Group>
            
            {userData.franchisee.phone && (
              <Group gap="sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <Text size="sm">{userData.franchisee.phone}</Text>
              </Group>
            )}
            
            {userData.franchisee.address && (
              <Group gap="sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Text size="sm">
                  {userData.franchisee.address}
                  {userData.franchisee.city && `, ${userData.franchisee.city}`}
                  {userData.franchisee.state && `, ${userData.franchisee.state}`}
                  {userData.franchisee.zip && ` ${userData.franchisee.zip}`}
                </Text>
              </Group>
            )}
            
            <Group gap="sm" mt="sm">
              {userData.franchisee.subscription_tier && (
                <Badge color={getTierColor(userData.franchisee.subscription_tier)}>
                  {userData.franchisee.subscription_tier.charAt(0).toUpperCase() + 
                   userData.franchisee.subscription_tier.slice(1)} Plan
                </Badge>
              )}
              
              {userData.franchisee.subscription_status && (
                <Badge color={getStatusColor(userData.franchisee.subscription_status)}>
                  {userData.franchisee.subscription_status.charAt(0).toUpperCase() + 
                   userData.franchisee.subscription_status.slice(1)}
                </Badge>
              )}
            </Group>
          </Stack>
        )}

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
