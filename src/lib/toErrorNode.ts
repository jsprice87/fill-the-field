
import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * Convert a plain string error message into the ReactNode Mantine expects.
 * – When `msg` is truthy, returns a <Text> element.
 * – When `msg` is falsy/undefined, returns `undefined`
 *   so the caller can omit the `error` prop entirely.
 */
export const toErrorNode = (msg?: string): ReactNode | undefined =>
  msg ? (
    <Text size="sm" c="red.6" fw={500}>
      {msg}
    </Text>
  ) : undefined;
