
import React, { useState } from 'react';
import { Title, Text, Stack, Group, Alert, Button, Card, TextInput, Textarea, Badge, Loader } from '@mantine/core';
import { Settings, Key, Webhook, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useGlobalSettings, useUpdateGlobalSetting } from '@/hooks/useGlobalSettings';

const GlobalSettings: React.FC = () => {
  const { data: settings, isLoading, error } = useGlobalSettings();
  const updateSetting = useUpdateGlobalSetting();

  const [formData, setFormData] = useState({
    mapbox_public_token: settings?.mapbox_public_token || '',
    webhook_url: settings?.webhook_url || '',
    webhook_auth_header: settings?.webhook_auth_header || '',
    support_email: settings?.support_email || '',
    support_phone: settings?.support_phone || '',
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        mapbox_public_token: settings.mapbox_public_token || '',
        webhook_url: settings.webhook_url || '',
        webhook_auth_header: settings.webhook_auth_header || '',
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
      });
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleBlur = async (key: string, value: string) => {
    if (settings?.[key] === value) return;
    try {
      await updateSetting.update({ key, value });
    } catch (err) {
      console.error(`Error updating global setting ${key}:`, err);
    }
  };

  if (isLoading) {
    return (
      <Stack h="100vh" justify="center" align="center">
        <Loader size="lg" />
        <Text c="dimmed">Loading settings...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<AlertTriangle size={16} />} title="Error" color="red" variant="filled">
        Failed to load global settings. Please try again later.
      </Alert>
    );
  }

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 600 }} mx="auto">
        <Title order={2} mb="md" className="flex items-center gap-2">
          <Settings size={24} />
          Global Settings
        </Title>

        <Card>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <Key size={20} />
            <Text fw={600}>Mapbox Public Token</Text>
          </Card.Section>
          <Card.Section className="p-4 space-y-2">
            <TextInput
              label="Mapbox Token"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwka..."
              value={formData.mapbox_public_token}
              onChange={(event) => handleChange('mapbox_public_token', event.currentTarget.value)}
              onBlur={(event) => handleBlur('mapbox_public_token', event.currentTarget.value)}
              disabled={updateSetting.isLoading}
            />
            <Text size="sm" color="dimmed">
              This token is used for all Mapbox maps across the platform.
            </Text>
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              Get your Mapbox token <ExternalLink size={14} />
            </a>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <Webhook size={20} />
            <Text fw={600}>Webhook Settings</Text>
          </Card.Section>
          <Card.Section className="p-4 space-y-4">
            <div>
              <TextInput
                label="Webhook URL"
                placeholder="https://your-webhook-url.com/endpoint"
                value={formData.webhook_url}
                onChange={(event) => handleChange('webhook_url', event.currentTarget.value)}
                onBlur={(event) => handleBlur('webhook_url', event.currentTarget.value)}
                disabled={updateSetting.isLoading}
              />
              <Text size="sm" color="dimmed">
                URL to receive webhook notifications for system events.
              </Text>
            </div>
            <div>
              <TextInput
                label="Webhook Auth Header"
                placeholder="Authorization: Bearer token"
                value={formData.webhook_auth_header}
                onChange={(event) => handleChange('webhook_auth_header', event.currentTarget.value)}
                onBlur={(event) => handleBlur('webhook_auth_header', event.currentTarget.value)}
                disabled={updateSetting.isLoading}
              />
              <Text size="sm" color="dimmed">
                Optional HTTP header for webhook authentication.
              </Text>
            </div>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <ExternalLink size={20} />
            <Text fw={600}>Support Contact Information</Text>
          </Card.Section>
          <Card.Section className="p-4 space-y-4">
            <div>
              <TextInput
                label="Support Email"
                type="email"
                placeholder="support@example.com"
                value={formData.support_email}
                onChange={(event) => handleChange('support_email', event.currentTarget.value)}
                onBlur={(event) => handleBlur('support_email', event.currentTarget.value)}
                disabled={updateSetting.isLoading}
              />
            </div>
            <div>
              <TextInput
                label="Support Phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.support_phone}
                onChange={(event) => handleChange('support_phone', event.currentTarget.value)}
                onBlur={(event) => handleBlur('support_phone', event.currentTarget.value)}
                disabled={updateSetting.isLoading}
              />
            </div>
          </Card.Section>
        </Card>

        {updateSetting.isError && (
          <Alert icon={<AlertTriangle size={16} />} title="Error" color="red" variant="filled">
            Failed to update settings. Please try again.
          </Alert>
        )}

        {updateSetting.isSuccess && (
          <Alert icon={<CheckCircle size={16} />} title="Success" color="green" variant="filled">
            Settings updated successfully.
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button
            onClick={() => {
              if (settings) {
                setFormData({
                  mapbox_public_token: settings.mapbox_public_token || '',
                  webhook_url: settings.webhook_url || '',
                  webhook_auth_header: settings.webhook_auth_header || '',
                  support_email: settings.support_email || '',
                  support_phone: settings.support_phone || '',
                });
              }
            }}
            disabled={updateSetting.isLoading}
          >
            Reset
          </Button>
        </Group>
    </Stack>
  );
};

export default GlobalSettings;
