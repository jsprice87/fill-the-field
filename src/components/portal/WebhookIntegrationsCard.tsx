import React, { useState, useEffect } from 'react';
import { Card } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@mantine/core';
import { Badge } from '@/components/ui/badge';
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
      <Card.Section>
        <Card.Section className="flex items-center gap-2 p-4 border-b">
          <Webhook className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Webhook Integrations</h3>
        </Card.Section>
      </Card.Section>
      <Card.Section className="space-y-6 p-4">
        <div>
          <Label htmlFor="test-webhook-url">Test Webhook URL</Label>
          <Input
            id="test-webhook-url"
            placeholder="https://example.com/webhook/test"
            value={testWebhookUrl}
            onChange={(e) => setTestWebhookUrl(e.target.value)}
            onBlur={(e) => handleTestUrlBlur(e.target.value)}
            disabled={updateSetting.isPending}
            className={testUrlError ? 'border-red-500' : ''}
          />
          {testUrlError && (
            <p className="text-sm text-red-600 mt-1">{testUrlError}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            URL to receive test webhook events. Used only for testing purposes.
          </p>
        </div>

        <div>
          <Label htmlFor="prod-webhook-url">Production Webhook URL</Label>
          <Input
            id="prod-webhook-url"
            placeholder="https://example.com/webhook/prod"
            value={prodWebhookUrl}
            onChange={(e) => setProdWebhookUrl(e.target.value)}
            onBlur={(e) => handleProdUrlBlur(e.target.value)}
            disabled={updateSetting.isPending}
            className={prodUrlError ? 'border-red-500' : ''}
          />
          {prodUrlError && (
            <p className="text-sm text-red-600 mt-1">{prodUrlError}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            URL to receive live webhook events for new leads and bookings.
          </p>
        </div>

        <div>
          <Label htmlFor="webhook-auth-header">Webhook Authorization Header</Label>
          <Input
            id="webhook-auth-header"
            placeholder="Authorization token or header value"
            value={authHeader}
            onChange={(e) => setAuthHeader(e.target.value)}
            onBlur={(e) => handleAuthHeaderBlur(e.target.value)}
            disabled={updateSetting.isPending}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Optional header value to include in webhook requests for authentication.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Webhooks send real-time notifications for new leads and bookings</li>
            <li>• Use the test URL to verify webhook payloads without affecting production</li>
            <li>• Production URL receives all live events</li>
            <li>• Authorization header is included in webhook requests if set</li>
          </ul>
        </div>
      </Card.Section>
    </Card>
  );
};

export default WebhookIntegrationsCard;
