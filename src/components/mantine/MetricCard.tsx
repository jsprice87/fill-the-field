
import React from 'react';
import { Paper, Text, Group, Title } from '@mantine/core';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  description 
}) => {
  return (
    <Paper 
      shadow="md" 
      radius="lg" 
      p="lg" 
      withBorder
      style={{
        transition: 'transform 150ms ease',
        cursor: 'default'
      }}
      sx={{
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500} c="dimmed" mb={4}>
          {label}
        </Text>
        <Icon size={16} className="text-muted-foreground" />
      </Group>
      
      <Title order={3} fw={700} mb={description ? "xs" : 0}>
        {value}
      </Title>
      
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}
    </Paper>
  );
};

