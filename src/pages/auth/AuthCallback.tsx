import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, Button, Container, Group, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get token and type from URL parameters
        const token = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!token || !type) {
          setStatus('error');
          setErrorMessage('Invalid authentication link. Please try again.');
          return;
        }

        // Handle different auth callback types
        let result;
        
        if (type === 'email') {
          // Email confirmation
          result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });
        } else if (type === 'recovery') {
          // Password reset
          result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
        } else if (type === 'invite') {
          // User invitation
          result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'invite'
          });
        } else {
          setStatus('error');
          setErrorMessage('Unknown authentication type. Please try again.');
          return;
        }

        const { data, error } = result;

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Authentication failed. The link may have expired.');
          return;
        }

        if (data.user && data.session) {
          setStatus('success');
          
          // Redirect based on auth type
          setTimeout(() => {
            if (type === 'recovery') {
              navigate('/portal/profile'); // Redirect to profile to change password
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const getStatusMessage = () => {
    const type = searchParams.get('type');
    switch (type) {
      case 'email':
        return 'Confirming your email address...';
      case 'recovery':
        return 'Processing password reset...';
      case 'invite':
        return 'Processing invitation...';
      default:
        return 'Processing authentication...';
    }
  };

  const getSuccessMessage = () => {
    const type = searchParams.get('type');
    switch (type) {
      case 'email':
        return 'Your email has been successfully confirmed!';
      case 'recovery':
        return 'Password reset confirmed. You can now update your password.';
      case 'invite':
        return 'Invitation accepted! Welcome to the platform.';
      default:
        return 'Authentication successful!';
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack align="center" gap="lg">
          <Title order={2} ta="center">
            Authentication
          </Title>

          {status === 'loading' && (
            <>
              <Loader size="lg" />
              <Text ta="center" c="dimmed">
                {getStatusMessage()}
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <IconCheck size={64} color="green" />
              <Alert
                icon={<IconCheck size={16} />}
                title="Success!"
                color="green"
                radius="md"
              >
                {getSuccessMessage()}
              </Alert>
              <Text ta="center" c="dimmed">
                Redirecting you...
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <IconX size={64} color="red" />
              <Alert
                icon={<IconX size={16} />}
                title="Authentication Failed"
                color="red"
                radius="md"
              >
                {errorMessage}
              </Alert>
              <Group gap="sm">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}