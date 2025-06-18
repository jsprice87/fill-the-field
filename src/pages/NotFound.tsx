
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Container, Stack, Title, Text, Button, Center } from '@mantine/core';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Container size="sm" py="xl">
      <Center style={{ minHeight: '70vh' }}>
        <Stack gap="lg" align="center" ta="center">
          <Title order={1} size="4rem" c="dimmed">
            404
          </Title>
          <Title order={2}>
            Oops! No Findy Page
          </Title>
          <Text c="dimmed" size="lg">
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Button 
            component={Link} 
            to="/" 
            leftSection={<Home size={16} />}
            size="lg"
          >
            Return to Home
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};

export default NotFound;
