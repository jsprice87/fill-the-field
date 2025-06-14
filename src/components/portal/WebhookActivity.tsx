
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface WebhookActivityProps {
  webhookLogs: any[];
  currentTestWebhookUrl: string;
  currentProdWebhookUrl: string;
}

export default function WebhookActivity({
  webhookLogs,
  currentTestWebhookUrl,
  currentProdWebhookUrl,
}: WebhookActivityProps) {
  const getStatusBadge = (log: any) => {
    if (log.delivered_at) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    } else if (log.error_message) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const recentLogs = webhookLogs?.slice(0, 5) || [];

  if (!currentTestWebhookUrl && !currentProdWebhookUrl) {
    return null;
  }

  return (
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
  );
}
