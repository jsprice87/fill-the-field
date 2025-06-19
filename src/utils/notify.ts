
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

type Status = 'success' | 'error' | 'info';

export function notify(status: Status, title: string, message?: string) {
  const base = { title, message, autoClose: 4000 };
  switch (status) {
    case 'success':
      showNotification({ ...base, color: 'green', icon: <IconCheck size={16} /> });
      break;
    case 'error':
      showNotification({ ...base, color: 'red', icon: <IconX size={16} /> });
      break;
    default:
      showNotification({ ...base, color: 'blue', icon: <IconInfoCircle size={16} /> });
  }
}
