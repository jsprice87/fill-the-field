
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, NumberInput, Switch } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Modal } from '@/components/mantine/Modal';
import { FormWrapper } from '@/components/mantine/FormWrapper';
import { TextInput } from '@/components/mantine/TextInput';
import { Textarea } from '@/components/mantine/Textarea';
import { toErrorNode } from '@/lib/toErrorNode';

const participantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  age: z.number().min(1, 'Age must be at least 1').max(18, 'Age must be 18 or under'),
  birth_date: z.date().optional(),
  notes: z.string().optional(),
  age_override: z.boolean().default(false),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ParticipantFormData) => void;
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
      birth_date: undefined,
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
        birth_date: undefined,
        notes: '',
        age_override: false,
        ...initialData,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: ParticipantFormData) => {
    if (onAddParticipant) {
      await onAddParticipant(data);
    } else {
      onSubmit(data);
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
              value={
                form.watch('birth_date')
                  ? new Date(form.watch('birth_date') as string)
                  : null
              }
              onChange={(value) => form.setValue('birth_date', value || undefined)}
              error={toErrorNode(form.formState.errors.birth_date?.message)}
              maxDate={new Date()}
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
