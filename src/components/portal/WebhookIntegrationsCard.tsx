import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from "@/hooks/useFranchiseeSettings";
import { useFranchiseeData } from "@/hooks/useFranchiseeData";
import { useWebhookLogs } from "@/hooks/useWebhookLogs";
import { useTestWebhook } from "@/hooks/useTestWebhook";
import { ExternalLink } from "lucide-react";
import { showTestWebhookModal } from "./TestWebhookModal";
import WebhookUrlFields from "./WebhookUrlFields";
import WebhookActivity from "./WebhookActivity";

export default function WebhookIntegrationsCard() {
  const { data: franchiseeData } = useFranchiseeData();
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  const { data: webhookLogs } = useWebhookLogs(franchiseeData?.id);
  const testWebhook = useTestWebhook();

  const [testWebhookUrl, setTestWebhookUrl] = useState("");
  const [prodWebhookUrl, setProdWebhookUrl] = useState("");
  const [authHeader, setAuthHeader] = useState("");
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

  const canSendTest = () => {
    return currentTestWebhookUrl && validateUrl(currentTestWebhookUrl) && !testWebhook.isPending;
  };

  const handleSendTestWebhook = (type: 'newLead' | 'newBooking') => {
    if (!currentTestWebhookUrl) {
      return;
    }

    showTestWebhookModal({
      webhookType: type === 'newLead' ? 'lead' : 'booking',
      onConfirm: () => testWebhook.mutate({ type })
    });
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
          Production URL processes live bookings and leads. Test URL is used only by the buttons below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <WebhookUrlFields
          testWebhookUrl={testWebhookUrl}
          prodWebhookUrl={prodWebhookUrl}
          authHeader={authHeader}
          currentTestWebhookUrl={currentTestWebhookUrl}
          currentProdWebhookUrl={currentProdWebhookUrl}
          currentAuthHeader={currentAuthHeader}
          testUrlError={testUrlError}
          prodUrlError={prodUrlError}
          setTestWebhookUrl={setTestWebhookUrl}
          setProdWebhookUrl={setProdWebhookUrl}
          setAuthHeader={setAuthHeader}
          onTestUrlBlur={handleTestUrlBlur}
          onProdUrlBlur={handleProdUrlBlur}
          onAuthHeaderBlur={handleAuthHeaderBlur}
        />

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Test Webhook Buttons</h4>
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
              title={!currentTestWebhookUrl ? "Enter a Test Webhook URL in Settings to enable this button" : undefined}
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
              title={!currentTestWebhookUrl ? "Enter a Test Webhook URL in Settings to enable this button" : undefined}
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

          {!currentTestWebhookUrl && (
            <p className="text-sm text-gray-500 mt-2">
              Enter a Test Webhook URL above to enable test buttons
            </p>
          )}
        </div>

        <WebhookActivity
          webhookLogs={webhookLogs}
          currentTestWebhookUrl={currentTestWebhookUrl}
          currentProdWebhookUrl={currentProdWebhookUrl}
        />

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <strong>Webhook Format:</strong> All events now use a unified JSON schema with event_type "newLead" or "newBooking".
          The payload includes lead information and booking details (empty for lead-only events).
        </div>
      </CardContent>
    </Card>
  );
}
