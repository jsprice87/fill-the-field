
import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, z } from 'zod';

export const createForm = <T extends ZodSchema>(
  schema: T,
  defaults: Partial<z.infer<T>>,
  options: Omit<UseFormProps<z.infer<T>>, 'resolver' | 'defaultValues'> = {},
) =>
  useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    ...options,
  });
