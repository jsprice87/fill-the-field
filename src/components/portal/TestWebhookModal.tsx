
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TestWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  webhookType: 'lead' | 'booking';
}

export default function TestWebhookModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  webhookType 
}: TestWebhookModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Test {webhookType === 'lead' ? 'Lead' : 'Booking'} Webhook</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>You're about to send a test webhook to your n8n test URL.</p>
            <p className="font-medium text-orange-600">
              ⚠️ Make sure to open your n8n workflow and click "▶︎ Execute Workflow" first.
            </p>
            <p className="text-sm text-gray-600">
              Test URLs only accept exactly 1 request after execution starts.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Send Test Webhook
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
