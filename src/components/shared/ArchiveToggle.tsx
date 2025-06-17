
import React from 'react';
import { Switch, Group, Text, Center } from '@mantine/core';
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
      <Center h="100%" w="100%">
        <Switch
          checked={showArchived}
          onChange={handleToggle}
          color="soccerGreen"
          size="md"
          radius="xl"
          aria-label="Archive toggle"
        />
      </Center>
      <Text size="sm" fw={500}>
        {showArchived ? 'Show Archived' : 'Show Active'}
      </Text>
    </Group>
  );
};

export default ArchiveToggle;

