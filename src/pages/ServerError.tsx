
import { Link } from "react-router-dom";
import { Container, Stack, Title, Text, Button, Center } from '@mantine/core';
import { Home, RefreshCw } from 'lucide-react';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container size="sm" py="xl">
      <Center style={{ minHeight: '70vh' }}>
        <Stack gap="lg" align="center" ta="center">
          <Title order={1} size="4rem" c="red.6">
            500
          </Title>
          <Title order={2}>
            Server Error
          </Title>
          <Text c="dimmed" size="lg">
            Something went wrong on our end. Please try again later.
          </Text>
          <Stack gap="sm" align="center">
            <Button 
              onClick={handleRefresh}
              leftSection={<RefreshCw size={16} />}
              variant="outline"
            >
              Try Again
            </Button>
            <Button 
              component={Link} 
              to="/" 
              leftSection={<Home size={16} />}
            >
              Return to Home
            </Button>
          </Stack>
        </Stack>
      </Center>
    </Container>
  );
};

export default ServerError;
