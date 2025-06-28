
import React from 'react';
import { Switch, Group, Text } from '@mantine/core';

interface StatusToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function StatusToggle({ checked, disabled = false, onChange, id }: StatusToggleProps) {
  return (
    <Group gap="sm">
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        aria-label="Location status toggle"
      />
      <Text size="sm" fw={500} c="gray.9">
        {checked ? "Location is active" : "Location is inactive"}
      </Text>
    </Group>
  );
}
