import { Badge, Stack, Group, Flex, Text, Card } from "@mantine/core";
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
      return <Badge color="green" leftSection={<CheckCircle size={12} />}>Success</Badge>;
    } else if (log.error_message) {
      return <Badge color="red" leftSection={<XCircle size={12} />}>Failed</Badge>;
    } else {
      return <Badge color="gray" leftSection={<Clock size={12} />}>Pending</Badge>;
    }
  };

  const recentLogs = webhookLogs?.slice(0, 5) || [];

  if (!currentTestWebhookUrl && !currentProdWebhookUrl) {
    return null;
  }

  return (
    <div style={{ paddingTop: 16, borderTop: "1px solid #e9ecef" }}>
      <Text size="sm" fw={500} mb="xs">Recent Webhook Activity</Text>
      {recentLogs.length > 0 ? (
        <Stack gap="xs">
          {recentLogs.map((log) => (
            <Card key={log.id} bg="gray.0" p="sm">
              <Flex justify="space-between" align="center">
                <Group gap="sm">
                  {getStatusBadge(log)}
                  <Text size="xs" ff="monospace">{log.event_type}</Text>
                </Group>
                <Group gap="sm">
                  <Text size="xs" c="dimmed">
                    {new Date(log.created_at).toLocaleString()}
                  </Text>
                  {log.attempt_count > 1 && (
                    <Text size="xs" c="dimmed">({log.attempt_count} attempts)</Text>
                  )}
                </Group>
              </Flex>
            </Card>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">No webhook activity yet</Text>
      )}
    </div>
  );
}
