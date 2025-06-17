
import React from 'react';
import { Switch, Group, Text } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';

interface ArchiveToggleProps {
  className?: string;
}

const ArchiveToggle: React.FC<ArchiveToggleProps> = ({
  className
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showArchived = searchParams.get('archived') === 'true';

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('archived', 'true');
    } else {
      newParams.delete('archived');
    }
    setSearchParams(newParams);
  };

  return (
    <Group gap="sm" className={className}>
      <Switch
        checked={showArchived}
        onChange={handleToggle}
        color="emerald"
        size="md"
        aria-label="Archive toggle"
      />
      <Text size="sm" fw={500}>
        {showArchived ? 'Show Archived' : 'Show Active'}
      </Text>
    </Group>
  );
};

export default ArchiveToggle;
