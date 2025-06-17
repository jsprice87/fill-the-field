
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
  const hideInactive = searchParams.get('hideInactive') === 'true';

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    const newParams = new URLSearchParams(searchParams);
    if (!checked) {
      // When toggle is OFF, hide inactive locations
      newParams.set('hideInactive', 'true');
    } else {
      // When toggle is ON, show all locations
      newParams.delete('hideInactive');
    }
    setSearchParams(newParams);
  };

  return (
    <Group gap="sm" className={className}>
      <Center h="100%" w="100%">
        <Switch
          checked={!hideInactive} // Inverted: checked means "show all"
          onChange={handleToggle}
          color="soccerGreen"
          size="md"
          radius="xl"
          aria-label="Toggle inactive locations"
        />
      </Center>
      <Text size="sm" fw={500}>
        {hideInactive ? 'Hiding Inactive' : 'Show All'}
      </Text>
    </Group>
  );
};

export default ArchiveToggle;
