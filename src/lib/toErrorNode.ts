
import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

/**  
 * Convert a plain string error message into the ReactNode Mantine expects.  
 * Returns `undefined` when there is no message so the `error` prop can be omitted.  
 */
export const toErrorNode = (msg?: string): ReactNode | undefined =>
  msg ? <Text size="sm" c="red.6" fw={500}>{msg}</Text> : undefined;
