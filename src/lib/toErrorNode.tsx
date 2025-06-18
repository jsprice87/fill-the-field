
import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

export const toErrorNode = (msg?: string): ReactNode | undefined =>
  msg ? (
    <Text size="sm" c="red.6" fw={500}>
      {msg}
    </Text>
  ) : undefined;
