
import { Label } from "@/components/ui/label";
import { TextInput } from "@/components/ui/input";

interface WebhookUrlFieldsProps {
  testWebhookUrl: string;
  prodWebhookUrl: string;
  authHeader: string;
  currentTestWebhookUrl: string;
  currentProdWebhookUrl: string;
  currentAuthHeader: string;
  testUrlError: string;
  prodUrlError: string;
  setTestWebhookUrl: (value: string) => void;
  setProdWebhookUrl: (value: string) => void;
  setAuthHeader: (value: string) => void;
  onTestUrlBlur: (value: string) => void;
  onProdUrlBlur: (value: string) => void;
  onAuthHeaderBlur: (value: string) => void;
}

export default function WebhookUrlFields({
  testWebhookUrl,
  prodWebhookUrl,
  authHeader,
  currentTestWebhookUrl,
  currentProdWebhookUrl,
  currentAuthHeader,
  testUrlError,
  prodUrlError,
  setTestWebhookUrl,
  setProdWebhookUrl,
  setAuthHeader,
  onTestUrlBlur,
  onProdUrlBlur,
  onAuthHeaderBlur,
}: WebhookUrlFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="test-webhook-url">Test Webhook URL</Label>
        <TextInput
          id="test-webhook-url"
          value={testWebhookUrl || currentTestWebhookUrl}
          onChange={(e) => setTestWebhookUrl(e.target.value)}
          onBlur={(e) => onTestUrlBlur(e.target.value)}
          placeholder="https://your-test-webhook-endpoint.com/webhook-test/..."
          error={!!testUrlError}
        />
        {testUrlError && (
          <p className="text-sm text-red-600 mt-1">{testUrlError}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Used only by the test buttons below. n8n must be in 'Execute Workflow' mode.
        </p>
      </div>

      <div>
        <Label htmlFor="prod-webhook-url">Production Webhook URL</Label>
        <TextInput
          id="prod-webhook-url"
          value={prodWebhookUrl || currentProdWebhookUrl}
          onChange={(e) => setProdWebhookUrl(e.target.value)}
          onBlur={(e) => onProdUrlBlur(e.target.value)}
          placeholder="https://your-production-webhook-endpoint.com/webhook/..."
          error={!!prodUrlError}
        />
        {prodUrl


{prodUrlError && (
          <p className="text-sm text-red-600 mt-1">{prodUrlError}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Processes live bookings and leads automatically.
        </p>
      </div>
      
      <div>
        <Label htmlFor="auth-header">Authorization Header (Optional)</Label>
        <TextInput
          id="auth-header"
          value={authHeader || currentAuthHeader}
          onChange={(e) => setAuthHeader(e.target.value)}
          onBlur={(e) => onAuthHeaderBlur(e.target.value)}
          placeholder="Bearer your-token-here"
          type="password"
        />
        <p className="text-sm text-gray-500 mt-1">
          Only applied to production webhook calls.
        </p>
      </div>
    </div>
  );
}
