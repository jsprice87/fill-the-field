
import React from 'react';
import { Text } from '@mantine/core';

export const toErrorNode = (msg?: string): React.ReactNode => {
  return msg ? <Text size="sm" c="red">{msg}</Text> : undefined;
};
