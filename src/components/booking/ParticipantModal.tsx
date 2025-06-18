
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, NumberInput, Switch, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Modal } from '@/components/mantine/Modal';
import { FormWrapper } from '@/components/mantine/FormWrapper';
import { TextInput } from '@/components/mantine/TextInput';
import { Textarea } from '@/components/mantine/Textarea';
import { toErrorNode } from '@/lib/toErrorNode';

const participantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  age: z.number().min(1, 'Age must be at least 1').max(18, 'Age must be 18 or under'),
  birth_date: z.date().nullable(),
  notes: z.string().optional(),
  age_override: z.boolean().default(false),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onAddParticipant?: (participant: any) => Promise<void>;
  initialData?: Partial<ParticipantFormData>;
  title?: string;
  classSchedule?: any;
  dayNames?: string[];
}

const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAddParticipant,
  initialData,
  title = 'Add Participant',
  classSchedule,
  dayNames,
}) => {
  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      first_name: '',
      age: 3,
      birth_date: initialData?.birth_date 
        ? (initialData.birth_date instanceof Date ? initialData.birth_date : new Date(initialData.birth_date))
        : null,
      notes: '',
      age_override: false,
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        first_name: '',
        age: 3,
        birth_date: initialData?.birth_date 
          ? (initialData.birth_date instanceof Date ? initialData.birth_date : new Date(initialData.birth_date))
          : null,
        notes: '',
        age_override: false,
        ...initialData,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: ParticipantFormData) => {
    // Convert to ISO string only at submission time
    const payload = {
      ...data,
      birth_date: data.birth_date ? data.birth_date.toISOString() : null,
    };

    if (onAddParticipant) {
      await onAddParticipant(payload);
    } else {
      onSubmit(payload);
    }
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <FormProvider {...form}>
        <FormWrapper
          onSubmit={form.handleSubmit(handleSubmit)}
          onCancel={onClose}
          submitLabel="Save Participant"
          isLoading={form.formState.isSubmitting}
        >
          <Stack gap="md">
            <TextInput
              label="Child's First Name"
              placeholder="Enter child's first name"
              {...form.register('first_name')}
              error={toErrorNode(form.formState.errors.first_name?.message)}
              required
            />

            <NumberInput
              label="Age"
              placeholder="Enter age"
              min={1}
              max={18}
              value={form.watch('age')}
              onChange={(value) => form.setValue('age', Number(value) || 3)}
              error={toErrorNode(form.formState.errors.age?.message)}
              required
            />

            <DateInput
              label="Birth Date (Optional)"
              placeholder="Select birth date"
              value={form.watch('birth_date')}
              onChange={(date) => form.setValue('birth_date', date)}
              error={form.formState.errors.birth_date && (
                <Text size="sm" c="red.6">
                  {form.formState.errors.birth_date.message}
                </Text>
              )}
              maxDate={new Date()}
              clearable
            />

            <Switch
              label="Age Override"
              description="Allow this child to participate regardless of class age restrictions"
              checked={form.watch('age_override')}
              onChange={(event) => form.setValue('age_override', event.currentTarget.checked)}
              color="soccerGreen"
              size="sm"
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="Any special notes about this child..."
              rows={3}
              {...form.register('notes')}
              error={toErrorNode(form.formState.errors.notes?.message)}
            />
          </Stack>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
};

export default ParticipantModal;
