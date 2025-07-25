
import { useForm, zodResolver } from '@mantine/form';
import { ZodSchema, z } from 'zod';

export const createForm = <T extends ZodSchema>(
  schema: T,
  defaults: Partial<z.infer<T>>,
) =>
  useForm<z.infer<T>>({
    initialValues: defaults,
    validate: zodResolver(schema),
  });
