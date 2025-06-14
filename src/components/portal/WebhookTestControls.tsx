
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface WebhookTestControlsProps {
  useTestUrl: boolean;
  setUseTestUrl: (value: boolean) => void;
  canSendTest: boolean;
  isTestPending: boolean;
  onSendTestWebhook: (type: 'newLead' | 'newBooking') => void;
  selectedUrl: string;
  isUrlValid: (url: string) => boolean;
}

export default function WebhookTestControls({
  useTestUrl,
  setUseTestUrl,
  canSendTest,
  isTestPending,
  onSendTestWebhook,
  selectedUrl,
  isUrlValid,
}: WebhookTestControlsProps) {
  return (
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
          onClick={() => onSendTestWebhook('newLead')}
          disabled={!canSendTest}
          className="flex items-center gap-2"
        >
          {isTestPending ? (
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
          onClick={() => onSendTestWebhook('newBooking')}
          disabled={!canSendTest}
          className="flex items-center gap-2"
        >
          {isTestPending ? (
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

      {!canSendTest && selectedUrl && !isUrlValid(selectedUrl) && (
        <p className="text-sm text-red-500 mt-2">
          Please enter a valid URL to enable test buttons
        </p>
      )}
      
      {!selectedUrl && (
        <p className="text-sm text-gray-500 mt-2">
          Please enter a {useTestUrl ? 'test' : 'production'} webhook URL to enable test buttons
        </p>
      )}
    </div>
  );
}
