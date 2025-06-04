
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Webhook, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';

const WebhookIntegrationsCard: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const { data: settings, isLoading } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookAuthHeader, setWebhookAuthHeader] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState('');

  // Initialize local state when settings load
  useEffect(() => {
    if (settings) {
      setWebhookUrl(settings.webhook_url || '');
      setWebhookAuthHeader(settings.webhook_auth_header || '');
      setHasUnsavedChanges(false);
    }
  }, [settings]);

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlValidationError('');
      return true; // Empty is valid (means no webhook)
    }
    
    try {
      const url = new URL(value.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        setUrlValidationError('URL must use HTTP or HTTPS protocol');
        return false;
      }
      setUrlValidationError('');
      return true;
    } catch {
      setUrlValidationError('Please enter a valid URL');
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setWebhookUrl(value);
    setHasUnsavedChanges(value !== (settings?.webhook_url || '') || webhookAuthHeader !== (settings?.webhook_auth_header || ''));
    validateUrl(value);
  };

  const handleAuthHeaderChange = (value: string) => {
    setWebhookAuthHeader(value);
    setHasUnsavedChanges(webhookUrl !== (settings?.webhook_url || '') || value !== (settings?.webhook_auth_header || ''));
  };

  const handleSave = async () => {
    const trimmedUrl = webhookUrl.trim();
    
    if (trimmedUrl && !validateUrl(trimmedUrl)) {
      return;
    }

    try {
      await updateSetting.mutateAsync({ 
        key: 'webhook_url', 
        value: trimmedUrl 
      });
      
      if (webhookAuthHeader !== (settings?.webhook_auth_header || '')) {
        await updateSetting.mutateAsync({ 
          key: 'webhook_auth_header', 
          value: webhookAuthHeader.trim() 
        });
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving webhook settings:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Workflow Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Workflow Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="webhook_url">Webhook URL</Label>
          <Input
            id="webhook_url"
            placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
            value={webhookUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={updateSetting.isPending}
            className={urlValidationError ? 'border-red-500' : ''}
          />
          {urlValidationError && (
            <p className="text-sm text-red-600 mt-1">{urlValidationError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Enter your n8n webhook URL to receive notifications about bookings, leads, and other events.
          </p>
        </div>
        
        <div>
          <Label htmlFor="webhook_auth_header">Authorization Header (Optional)</Label>
          <Input
            id="webhook_auth_header"
            type="password"
            placeholder="Bearer your-secret-token"
            value={webhookAuthHeader}
            onChange={(e) => handleAuthHeaderChange(e.target.value)}
            disabled={updateSetting.isPending}
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional authentication header for secure webhook delivery.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          {hasUnsavedChanges && (
            <Button 
              onClick={handleSave}
              disabled={updateSetting.isPending || !!urlValidationError}
              className="flex-1"
            >
              {updateSetting.isPending ? 'Saving...' : 'Save Webhook Settings'}
            </Button>
          )}
          
          <Link 
            to={`/${franchiseeSlug}/portal/help`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              <HelpCircle className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </Link>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            <strong>Security Note:</strong> Only use HTTPS URLs for production webhooks. 
            Your webhook will receive sensitive customer data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookIntegrationsCard;
