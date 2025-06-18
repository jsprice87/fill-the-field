
import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * Converts a plain string error message into the ReactNode format expected by
 * Mantine's `error` prop.  
 * – If `msg` is defined and non-empty, return a red <Text>.  
 * – Otherwise return `undefined` (⚠️ never `false`, which confuses the type-checker).
 */
export const toErrorNode = (msg?: string): ReactNode | undefined =>
  msg ? (
    <Text size="sm" c="red.6" fw={500}>
      {msg}
    </Text>
  ) : undefined;
