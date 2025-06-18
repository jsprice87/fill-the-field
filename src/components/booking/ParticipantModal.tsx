
import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Switch, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Modal } from '@/components/mantine/Modal';
import { FormWrapper } from '@/components/mantine/FormWrapper';
import { TextInput } from '@/components/mantine/TextInput';
import { NumberInput } from '@/components/mantine/NumberInput';
import { Textarea } from '@/components/mantine/Textarea';
import { toErrorNode } from '@/lib/toErrorNode';
import { toDate } from '@/utils/normalize';
import { createForm } from '@/hooks/createForm';

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
  const form = createForm(participantSchema, {
    first_name: '',
    age: 3,
    notes: '',
    age_override: false,
    ...initialData,
    birth_date: toDate(initialData?.birth_date),
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        birth_date: toDate(initialData.birth_date),
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
              {...form.getInputProps('age')}
              error={toErrorNode(form.formState.errors.age?.message)}
              required
            />

            <DateInput
              label="Birth Date (Optional)"
              placeholder="Select birth date"
              {...form.getInputProps('birth_date')}
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
              {...form.getInputProps('age_override')}
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
