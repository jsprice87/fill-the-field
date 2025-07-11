import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, Button, Container, Group, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconX, IconMail } from "@tabler/icons-react";

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get token and type from URL parameters
        const token = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!token || type !== 'email') {
          setStatus('error');
          setErrorMessage('Invalid confirmation link. Please check your email and try again.');
          return;
        }

        // Verify the email confirmation token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Failed to confirm email. The link may have expired.');
          return;
        }

        if (data.user && data.session) {
          setStatus('success');
          
          // Redirect to dashboard after successful confirmation
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage('Email confirmation failed. Please try again.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    try {
      const email = searchParams.get('email');
      if (!email) {
        setErrorMessage('Email address not found. Please register again.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('');
        alert('Confirmation email resent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      setErrorMessage('Failed to resend confirmation email. Please try again.');
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack align="center" gap="lg">
          <Title order={2} ta="center">
            Email Confirmation
          </Title>

          {status === 'loading' && (
            <>
              <Loader size="lg" />
              <Text ta="center" c="dimmed">
                Confirming your email address...
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <IconCheck size={64} color="green" />
              <Alert
                icon={<IconCheck size={16} />}
                title="Email Confirmed!"
                color="green"
                radius="md"
              >
                Your email has been successfully confirmed. You are now logged in and will be redirected to your dashboard shortly.
              </Alert>
              <Text ta="center" c="dimmed">
                Redirecting you to your dashboard...
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <IconX size={64} color="red" />
              <Alert
                icon={<IconX size={16} />}
                title="Confirmation Failed"
                color="red"
                radius="md"
              >
                {errorMessage}
              </Alert>
              <Group gap="sm">
                <Button
                  variant="outline"
                  leftSection={<IconMail size={16} />}
                  onClick={handleResendEmail}
                >
                  Resend Confirmation Email
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}