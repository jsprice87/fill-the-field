import React, { useState, useEffect } from 'react';
import { Card, Button, Stack, Group, Flex, Title, Text } from '@mantine/core';
import { TextInput } from '@/components/mantine/TextInput';
import { Webhook, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';

const WebhookIntegrationsCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  const [testWebhookUrl, setTestWebhookUrl] = useState('');
  const [prodWebhookUrl, setProdWebhookUrl] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [testUrlError, setTestUrlError] = useState('');
  const [prodUrlError, setProdUrlError] = useState('');

  useEffect(() => {
    if (settings) {
      setTestWebhookUrl(settings.webhook_url_test || '');
      setProdWebhookUrl(settings.webhook_url_prod || '');
      setAuthHeader(settings.webhook_auth_header || '');
    }
  }, [settings]);

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleTestUrlBlur = async (value: string) => {
    if (value === settings?.webhook_url_test) return;

    if (value && !validateUrl(value)) {
      setTestUrlError('Please enter a valid http:// or https:// URL');
      return;
    }

    setTestUrlError('');
    try {
      await updateSetting.mutateAsync({
        key: 'webhook_url_test',
        value: value
      });
    } catch (error) {
      console.error('Error saving test webhook URL:', error);
    }
  };

  const handleProdUrlBlur = async (value: string) => {
    if (value === settings?.webhook_url_prod) return;

    if (value && !validateUrl(value)) {
      setProdUrlError('Please enter a valid http:// or https:// URL');
      return;
    }

    setProdUrlError('');
    try {
      await updateSetting.mutateAsync({
        key: 'webhook_url_prod',
        value: value
      });
    } catch (error) {
      console.error('Error saving production webhook URL:', error);
    }
  };

  const handleAuthHeaderBlur = async (value: string) => {
    if (value === settings?.webhook_auth_header) return;

    try {
      await updateSetting.mutateAsync({
        key: 'webhook_auth_header',
        value: value
      });
    } catch (error) {
      console.error('Error saving auth header:', error);
    }
  };

  return (
    <Card>
      <Card.Section withBorder>
        <Flex align="center" gap="sm" p="md">
          <Webhook size={20} />
          <Title order={3}>Webhook Integrations</Title>
        </Flex>
      </Card.Section>
      <Card.Section p="md">
        <Stack gap="md">
          <div>
            <TextInput
              label="Test Webhook URL"
              placeholder="https://example.com/webhook/test"
              value={testWebhookUrl}
              onChange={(e) => setTestWebhookUrl(e.target.value)}
              onBlur={(e) => handleTestUrlBlur(e.target.value)}
              disabled={updateSetting.isPending}
              error={testUrlError}
              description="URL to receive test webhook events. Used only for testing purposes."
            />
          </div>

          <div>
            <TextInput
              label="Production Webhook URL"
              placeholder="https://example.com/webhook/prod"
              value={prodWebhookUrl}
              onChange={(e) => setProdWebhookUrl(e.target.value)}
              onBlur={(e) => handleProdUrlBlur(e.target.value)}
              disabled={updateSetting.isPending}
              error={prodUrlError}
              description="URL to receive live webhook events for new leads and bookings."
            />
          </div>

          <div>
            <TextInput
              label="Webhook Authorization Header"
              placeholder="Authorization token or header value"
              value={authHeader}
              onChange={(e) => setAuthHeader(e.target.value)}
              onBlur={(e) => handleAuthHeaderBlur(e.target.value)}
              disabled={updateSetting.isPending}
              description="Optional header value to include in webhook requests for authentication."
            />
          </div>

          <Card bg="blue.0" p="md">
            <Title order={4} c="blue.9" mb="xs">How it works:</Title>
            <Text size="sm" c="blue.8">
              • Webhooks send real-time notifications for new leads and bookings
              <br />
              • Use the test URL to verify webhook payloads without affecting production
              <br />
              • Production URL receives all live events
              <br />
              • Authorization header is included in webhook requests if set
            </Text>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default WebhookIntegrationsCard;
