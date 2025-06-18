
import { useForm, zodResolver } from '@mantine/form';
import { ZodSchema, z } from 'zod';

export const useZodForm = <T extends ZodSchema>(
  schema: T,
  initial: Partial<z.infer<T>>,
) =>
  useForm<z.infer<T>>({
    initialValues: initial,
    validate: zodResolver(schema),
  });
