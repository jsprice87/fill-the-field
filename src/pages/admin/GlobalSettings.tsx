
import React, { useState } from 'react';
import { Title, Text, Stack, Group, Alert } from '@mantine/core';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Webhook, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useGlobalSettings, useUpdateGlobalSetting } from '@/hooks/useGlobalSettings';
import { AdminShell } from '@/layout/AdminShell';

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
      <AdminShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </Stack>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <Alert icon={<AlertTriangle size={16} />} title="Error" color="red" variant="filled">
          Failed to load global settings. Please try again later.
        </Alert>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
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
            <Label htmlFor="mapbox_public_token">Mapbox Token</Label>
            <Input
              id="mapbox_public_token"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwia..."
              value={formData.mapbox_public_token}
              onChange={(e) => handleChange('mapbox_public_token', e.target.value)}
              onBlur={(e) => handleBlur('mapbox_public_token', e.target.value)}
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
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                placeholder="https://your-webhook-url.com/endpoint"
                value={formData.webhook_url}
                onChange={(e) => handleChange('webhook_url', e.target.value)}
                onBlur={(e) => handleBlur('webhook_url', e.target.value)}
                disabled={updateSetting.isLoading}
              />
              <Text size="sm" color="dimmed">
                URL to receive webhook notifications for system events.
              </Text>
            </div>
            <div>
              <Label htmlFor="webhook_auth_header">Webhook Auth Header</Label>
              <Input
                id="webhook_auth_header"
                placeholder="Authorization: Bearer token"
                value={formData.webhook_auth_header}
                onChange={(e) => handleChange('webhook_auth_header', e.target.value)}
                onBlur={(e) => handleBlur('webhook_auth_header', e.target.value)}
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
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                placeholder="support@example.com"
                value={formData.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                onBlur={(e) => handleBlur('support_email', e.target.value)}
                disabled={updateSetting.isLoading}
              />
            </div>
            <div>
              <Label htmlFor="support_phone">Support Phone</Label>
              <Input
                id="support_phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                onBlur={(e) => handleBlur('support_phone', e.target.value)}
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
    </AdminShell>
  );
};

export default GlobalSettings;
