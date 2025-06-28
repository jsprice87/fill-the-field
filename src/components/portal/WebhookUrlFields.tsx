import { Stack, Text } from "@mantine/core";
import { TextInput } from "@/components/mantine/TextInput";

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
    <Stack gap="md">
      <div>
        <TextInput
          label="Test Webhook URL"
          value={testWebhookUrl || currentTestWebhookUrl}
          onChange={(e) => setTestWebhookUrl(e.target.value)}
          onBlur={(e) => onTestUrlBlur(e.target.value)}
          placeholder="https://your-test-webhook-endpoint.com/webhook-test/..."
          error={testUrlError}
          description="Used only by the test buttons below. n8n must be in 'Execute Workflow' mode."
        />
      </div>

      <div>
        <TextInput
          label="Production Webhook URL"
          value={prodWebhookUrl || currentProdWebhookUrl}
          onChange={(e) => setProdWebhookUrl(e.target.value)}
          onBlur={(e) => onProdUrlBlur(e.target.value)}
          placeholder="https://your-production-webhook-endpoint.com/webhook/..."
          error={prodUrlError}
          description="Processes live bookings and leads automatically."
        />
      </div>
      
      <div>
        <TextInput
          label="Authorization Header (Optional)"
          value={authHeader || currentAuthHeader}
          onChange={(e) => setAuthHeader(e.target.value)}
          onBlur={(e) => onAuthHeaderBlur(e.target.value)}
          placeholder="Bearer your-token-here"
          type="password"
          description="Only applied to production webhook calls."
        />
      </div>
    </Stack>
  );
}
