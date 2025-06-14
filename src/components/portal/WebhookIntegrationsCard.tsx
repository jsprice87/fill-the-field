
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from "@/hooks/useFranchiseeSettings";
import { useFranchiseeData } from "@/hooks/useFranchiseeData";
import { useWebhookLogs } from "@/hooks/useWebhookLogs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

export default function WebhookIntegrationsCard() {
  const { data: franchiseeData } = useFranchiseeData();
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  const { data: webhookLogs } = useWebhookLogs(franchiseeData?.id);

  const [webhookUrl, setWebhookUrl] = useState("");
  const [authHeader, setAuthHeader] = useState("");

  // Get current settings
  const currentWebhookUrl = settings?.webhook_url ?? '';
  const currentAuthHeader = settings?.webhook_auth_header ?? '';

  const handleSaveWebhook = async () => {
    if (!franchiseeData?.id) return;

    try {
      await updateSetting.mutateAsync({
        key: 'webhook_url',
        value: webhookUrl
      });

      if (authHeader) {
        await updateSetting.mutateAsync({
          key: 'webhook_auth_header',
          value: authHeader
        });
      }

      toast.success('Webhook settings saved successfully');
      setWebhookUrl("");
      setAuthHeader("");
    } catch (error) {
      toast.error('Failed to save webhook settings');
      console.error('Error saving webhook settings:', error);
    }
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
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl || currentWebhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-endpoint.com/webhook"
            />
          </div>
          
          <div>
            <Label htmlFor="auth-header">Authorization Header (Optional)</Label>
            <Input
              id="auth-header"
              value={authHeader || currentAuthHeader}
              onChange={(e) => setAuthHeader(e.target.value)}
              placeholder="Bearer your-token-here"
              type="password"
            />
          </div>

          <Button 
            onClick={handleSaveWebhook}
            disabled={updateSetting.isPending}
          >
            {updateSetting.isPending ? 'Saving...' : 'Save Webhook Settings'}
          </Button>
        </div>

        {currentWebhookUrl && (
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
