
import React from 'react';
import { Container, Paper, Stack, Title, Text, Center } from '@mantine/core';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--mantine-color-gray-0)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container size="sm" py="xl">
        <Center>
          <Paper shadow="md" p="xl" radius="md" w="100%" maw={400}>
            <Stack gap="lg">
              <div style={{ textAlign: 'center' }}>
                <Title order={2} size="h1" fw={600}>
                  {title}
                </Title>
                {subtitle && (
                  <Text c="dimmed" size="sm" mt="xs">
                    {subtitle}
                  </Text>
                )}
              </div>
              {children}
            </Stack>
          </Paper>
        </Center>
      </Container>
    </div>
  );
};
