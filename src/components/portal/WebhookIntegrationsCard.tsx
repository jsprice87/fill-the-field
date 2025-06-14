
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from "@/hooks/useFranchiseeSettings";
import { useFranchiseeData } from "@/hooks/useFranchiseeData";
import { useWebhookLogs } from "@/hooks/useWebhookLogs";
import { useTestWebhook } from "@/hooks/useTestWebhook";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import TestWebhookModal from "./TestWebhookModal";

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
  const [showTestModal, setShowTestModal] = useState(false);
  const [pendingTestType, setPendingTestType] = useState<'newLead' | 'newBooking' | null>(null);

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
      return;
    }

    if (useTestUrl) {
      // Show confirmation modal for test URL
      setPendingTestType(type);
      setShowTestModal(true);
    } else {
      // Send directly to production URL
      testWebhook.mutate({ type, url: selectedUrl });
    }
  };

  const handleConfirmTest = () => {
    const selectedUrl = getSelectedUrl();
    if (pendingTestType && selectedUrl) {
      testWebhook.mutate({ type: pendingTestType, url: selectedUrl });
    }
    setShowTestModal(false);
    setPendingTestType(null);
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
    <>
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
                placeholder="https://your-test-webhook-endpoint.com/webhook-test/..."
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
                placeholder="https://your-production-webhook-endpoint.com/webhook/..."
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
              <div className="flex items-center space-x-2 mb-2">
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
              
              <p className="text-xs text-gray-500 mb-4">
                💡 n8n test URLs accept exactly 1 request after you press 'Execute Workflow'. Production URLs listen continuously.
              </p>

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
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                    </svg>
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
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v4"/>
                      <path d="M16 2v4"/>
                      <rect width="18" height="18" x="3" y="4" rx="2"/>
                      <path d="M3 10h18"/>
                      <path d="m9 16 2 2 4-4"/>
                    </svg>
                  )}
                  Send Test Booking Webhook
                </Button>
              </div>

              {!canSendTest() && getSelectedUrl() && !isUrlValid(getSelectedUrl()) && (
                <p className="text-sm text-red-500 mt-2">
                  Please enter a valid URL to enable test buttons
                </p>
              )}
              
              {!getSelectedUrl() && (
                <p className="text-sm text-gray-500 mt-2">
                  Please enter a {useTestUrl ? 'test' : 'production'} webhook URL to enable test buttons
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

      <TestWebhookModal
        open={showTestModal}
        onOpenChange={setShowTestModal}
        onConfirm={handleConfirmTest}
        webhookType={pendingTestType === 'newLead' ? 'lead' : 'booking'}
      />
    </>
  );
}
