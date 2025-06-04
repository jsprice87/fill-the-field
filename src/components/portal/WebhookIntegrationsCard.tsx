
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, ExternalLink, HelpCircle, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import { useWebhookLogs, useTestWebhook } from '@/hooks/useWebhookLogs';
import { toast } from 'sonner';

const WebhookIntegrationsCard: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const { data: settings, isLoading } = useFranchiseeSettings();
  const { data: webhookLogs, refetch: refetchLogs } = useWebhookLogs(5);
  const testWebhook = useTestWebhook();
  const updateSetting = useUpdateFranchiseeSetting();
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookAuthHeader, setWebhookAuthHeader] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

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

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Please configure a webhook URL first');
      return;
    }

    if (hasUnsavedChanges) {
      toast.error('Please save your webhook settings before testing');
      return;
    }

    setIsTestingWebhook(true);
    try {
      const result = await testWebhook();
      if (result.success) {
        toast.success('Test webhook sent successfully!');
      } else {
        toast.error(`Test webhook failed: ${result.error_message}`);
      }
      refetchLogs();
    } catch (error) {
      console.error('Test webhook error:', error);
      toast.error(`Test webhook failed: ${error.message}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const getStatusIcon = (log: any) => {
    if (log.delivered_at) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (log: any) => {
    if (log.delivered_at) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
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
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
            
            <Button
              onClick={handleTestWebhook}
              disabled={isTestingWebhook || !webhookUrl.trim() || hasUnsavedChanges}
              variant="outline"
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
            </Button>
            
            <Link 
              to={`/${franchiseeSlug}/portal/help`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <HelpCircle className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </Link>
          </div>
        </div>

        {/* Webhook Logs Section */}
        {webhookLogs && webhookLogs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Recent Webhook Deliveries</h4>
            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.event_type}</span>
                        {getStatusBadge(log)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.response_status && (
                      <div className="text-sm text-gray-600">
                        HTTP {log.response_status}
                      </div>
                    )}
                    {log.error_message && (
                      <div className="text-xs text-red-600 max-w-32 truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
