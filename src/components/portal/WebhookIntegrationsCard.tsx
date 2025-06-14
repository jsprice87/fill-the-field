
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from "@/hooks/useFranchiseeSettings";
import { useFranchiseeData } from "@/hooks/useFranchiseeData";
import { useWebhookLogs } from "@/hooks/useWebhookLogs";
import { useTestWebhook } from "@/hooks/useTestWebhook";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink, Rocket } from "lucide-react";

export default function WebhookIntegrationsCard() {
  const { data: franchiseeData } = useFranchiseeData();
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  const { data: webhookLogs } = useWebhookLogs(franchiseeData?.id);
  const testWebhook = useTestWebhook();

  const [testWebhookUrl, setTestWebhookUrl] = useState("");
  const [prodWebhookUrl, setProdWebhookUrl] = useState("");
  const [authHeader, setAuthHeader] = useState("");
  const [useTestUrl, setUseTestUrl] = useState(false);
  const [testUrlError, setTestUrlError] = useState("");
  const [prodUrlError, setProdUrlError] = useState("");

  // Get current settings
  const currentTestWebhookUrl = settings?.webhook_url_test ?? '';
  const currentProdWebhookUrl = settings?.webhook_url_prod ?? '';
  const currentAuthHeader = settings?.webhook_auth_header ?? '';

  // URL validation function
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
    if (value === currentTestWebhookUrl) return;
    
    if (value && !validateUrl(value)) {
      setTestUrlError("Please enter a valid http:// or https:// URL");
      return;
    }
    
    setTestUrlError("");
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
    if (value === currentProdWebhookUrl) return;
    
    if (value && !validateUrl(value)) {
      setProdUrlError("Please enter a valid http:// or https:// URL");
      return;
    }
    
    setProdUrlError("");
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
    if (value === currentAuthHeader) return;
    
    try {
      await updateSetting.mutateAsync({
        key: 'webhook_auth_header',
        value: value
      });
    } catch (error) {
      console.error('Error saving auth header:', error);
    }
  };

  const getSelectedUrl = () => {
    return useTestUrl ? 
      (testWebhookUrl || currentTestWebhookUrl) : 
      (prodWebhookUrl || currentProdWebhookUrl);
  };

  const isUrlValid = (url: string) => {
    return url && validateUrl(url);
  };

  const canSendTest = () => {
    const selectedUrl = getSelectedUrl();
    return isUrlValid(selectedUrl) && !testWebhook.isPending;
  };

  const handleSendTestWebhook = (type: 'newLead' | 'newBooking') => {
    const selectedUrl = getSelectedUrl();
    if (!selectedUrl) {
      toast.error('Please enter a webhook URL first');
      return;
    }

    testWebhook.mutate({ type, url: selectedUrl });
  };

  const recentLogs = webhookLogs?.slice(0, 5) || [];

  const getStatusBadge = (log: any) => {
    if (log.delivered_at) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    } else if (log.error_message) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Webhook Integrations
        </CardTitle>
        <CardDescription>
          Configure webhook URLs to receive real-time notifications for new leads and bookings.
          The webhook will automatically send unified events when leads are created or bookings are completed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="test-webhook-url">Test Webhook URL</Label>
            <Input
              id="test-webhook-url"
              value={testWebhookUrl || currentTestWebhookUrl}
              onChange={(e) => setTestWebhookUrl(e.target.value)}
              onBlur={(e) => handleTestUrlBlur(e.target.value)}
              placeholder="https://your-test-webhook-endpoint.com/webhook"
              error={!!testUrlError}
            />
            {testUrlError && (
              <p className="text-sm text-red-600 mt-1">{testUrlError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="prod-webhook-url">Production Webhook URL</Label>
            <Input
              id="prod-webhook-url"
              value={prodWebhookUrl || currentProdWebhookUrl}
              onChange={(e) => setProdWebhookUrl(e.target.value)}
              onBlur={(e) => handleProdUrlBlur(e.target.value)}
              placeholder="https://your-production-webhook-endpoint.com/webhook"
              error={!!prodUrlError}
            />
            {prodUrlError && (
              <p className="text-sm text-red-600 mt-1">{prodUrlError}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="auth-header">Authorization Header (Optional)</Label>
            <Input
              id="auth-header"
              value={authHeader || currentAuthHeader}
              onChange={(e) => setAuthHeader(e.target.value)}
              onBlur={(e) => handleAuthHeaderBlur(e.target.value)}
              placeholder="Bearer your-token-here"
              type="password"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="use-test-url"
                checked={useTestUrl}
                onCheckedChange={setUseTestUrl}
              />
              <Label htmlFor="use-test-url" className="text-sm font-medium">
                Use Test URL
              </Label>
              <span className="text-xs text-gray-500">
                ({useTestUrl ? 'Test' : 'Production'} URL selected)
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendTestWebhook('newLead')}
                disabled={!canSendTest()}
                className="flex items-center gap-2"
              >
                {testWebhook.isPending ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                Send Test Lead Webhook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendTestWebhook('newBooking')}
                disabled={!canSendTest()}
                className="flex items-center gap-2"
              >
                {testWebhook.isPending ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                Send Test Booking Webhook
              </Button>
            </div>

            {!canSendTest() && getSelectedUrl() && (
              <p className="text-sm text-gray-500 mt-2">
                Please enter a valid URL to enable test buttons
              </p>
            )}
          </div>
        </div>

        {(currentTestWebhookUrl || currentProdWebhookUrl) && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-3">Recent Webhook Activity</h4>
            {recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log)}
                      <span className="font-mono text-xs">{log.event_type}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                      {log.attempt_count > 1 && (
                        <span className="ml-2">({log.attempt_count} attempts)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No webhook activity yet</p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <strong>Webhook Format:</strong> All events now use a unified JSON schema with event_type "newLead" or "newBooking".
          The payload includes lead information and booking details (empty for lead-only events).
        </div>
      </CardContent>
    </Card>
  );
}
