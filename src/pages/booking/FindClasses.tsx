import React, { useState, useEffect } from 'react';
import { Container, Stack, Title, Text, Group, Button, Loader } from '@mantine/core';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLocations } from '@/hooks/useLocations';
import { LocationCard } from '@/components/booking/LocationCard';
import SearchInput from '@/components/shared/SearchInput';
import ArchiveToggle from '@/components/shared/ArchiveToggle';
import { notify } from '@/utils/notify';
import { useDebounce } from '@mantine/hooks';

const FindClasses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const navigate = useNavigate();

  const { data: locations, isLoading, isError } = useLocations(); // Remove argument

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      newParams.set('search', debouncedSearchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [debouncedSearchTerm, setSearchParams, searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (isError) {
    notify('error', 'Failed to load locations.');
    return <Text>Failed to load locations.</Text>;
  }

  const filteredLocations = locations?.filter(location => {
    const searchTermLower = debouncedSearchTerm.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchTermLower) ||
      location.address.toLowerCase().includes(searchTermLower) ||
      location.city.toLowerCase().includes(searchTermLower)
    );
  });

  const handleLocationClick = (locationId: string) => {
    navigate(`/location/${locationId}/classes`);
  };

  return (
    <Container size="xl" py="md">
      <Stack>
        <Title order={2} align="center">
          Find Classes Near You
        </Title>
        <Text color="dimmed" align="center">
          Explore our locations and discover the perfect class for your child.
        </Text>

        <Group position="apart">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by location name, address, or city..."
            className="w-full max-w-md"
          />
          <ArchiveToggle />
        </Group>

        {isLoading ? (
          <Group position="center">
            <Loader />
          </Group>
        ) : filteredLocations && filteredLocations.length > 0 ? (
          <Group spacing="lg" grow>
            {filteredLocations.map(location => (
              <LocationCard
                key={location.id}
                location={location}
                onClick={() => handleLocationClick(location.id)}
              />
            ))}
          </Group>
        ) : (
          <Text color="dimmed" align="center">
            No locations found.
          </Text>
        )}
      </Stack>
    </Container>
  );
};

export default FindClasses;
