
import { openConfirmModal } from '@mantine/modals';
import { Text } from '@mantine/core';

interface TestWebhookModalProps {
  onConfirm: () => void;
  webhookType: 'lead' | 'booking';
}

export const showTestWebhookModal = ({ onConfirm, webhookType }: TestWebhookModalProps) => {
  openConfirmModal({
    title: `Send Test ${webhookType === 'lead' ? 'Lead' : 'Booking'} Webhook`,
    children: (
      <div className="space-y-2">
        <Text size="sm">You're about to send a test webhook to your n8n test URL.</Text>
        <Text size="sm" className="font-medium text-orange-600">
          ⚠️ Make sure to open your n8n workflow and click "▶︎ Execute Workflow" first.
        </Text>
        <Text size="xs" className="text-gray-600">
          Test URLs only accept exactly 1 request after execution starts.
        </Text>
      </div>
    ),
    labels: { confirm: 'Send Test Webhook', cancel: 'Cancel' },
    confirmProps: { color: 'blue' },
    onConfirm,
  });
};
