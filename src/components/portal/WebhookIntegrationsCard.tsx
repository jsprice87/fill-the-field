import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from "@/hooks/useFranchiseeSettings";
import { useFranchiseeData } from "@/hooks/useFranchiseeData";
import { useWebhookLogs } from "@/hooks/useWebhookLogs";
import { useTestWebhook } from "@/hooks/useTestWebhook";
import { ExternalLink } from "lucide-react";
import TestWebhookModal from "./TestWebhookModal";
import WebhookUrlFields from "./WebhookUrlFields";
import WebhookTestControls from "./WebhookTestControls";
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

          <WebhookTestControls
            useTestUrl={useTestUrl}
            setUseTestUrl={setUseTestUrl}
            canSendTest={canSendTest()}
            isTestPending={testWebhook.isPending}
            onSendTestWebhook={handleSendTestWebhook}
            selectedUrl={getSelectedUrl()}
            isUrlValid={isUrlValid}
            currentTestWebhookUrl={currentTestWebhookUrl}
          />

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

      <TestWebhookModal
        open={showTestModal}
        onOpenChange={setShowTestModal}
        onConfirm={handleConfirmTest}
        webhookType={pendingTestType === 'newLead' ? 'lead' : 'booking'}
      />
    </>
  );
}
