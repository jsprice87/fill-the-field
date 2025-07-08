import React from 'react';
import { Group, Paper, Text, Button, ActionIcon, Badge } from '@mantine/core';
import { X, Eye, User } from 'lucide-react';

interface ImpersonationBannerProps {
  targetUser: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  onExitImpersonation: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({
  targetUser,
  onExitImpersonation
}) => {
  return (
    <Paper
      bg="orange.1"
      p="sm"
      radius={0}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid var(--mantine-color-orange-3)',
        borderLeft: '4px solid var(--mantine-color-orange-6)'
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm">
          <Eye size={20} style={{ color: 'var(--mantine-color-orange-6)' }} />
          <Text size="sm" fw={500} c="orange.8">
            Admin Impersonation Mode
          </Text>
          <Badge variant="light" color="orange" size="sm">
            IMPERSONATING
          </Badge>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <Group gap="xs">
            <User size={14} style={{ color: 'var(--mantine-color-orange-6)' }} />
            <Text size="sm" c="orange.8">
              {targetUser.name}
            </Text>
            <Text size="sm" c="orange.6">
              ({targetUser.email})
            </Text>
            {targetUser.company && (
              <Text size="sm" c="orange.6">
                • {targetUser.company}
              </Text>
            )}
          </Group>
          
          <Button
            variant="light"
            color="orange"
            size="xs"
            onClick={onExitImpersonation}
            rightSection={<X size={14} />}
          >
            Exit Impersonation
          </Button>
        </Group>
      </Group>
    </Paper>
  );
};