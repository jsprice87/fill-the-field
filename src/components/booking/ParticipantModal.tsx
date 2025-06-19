
import React, { useEffect } from 'react';
import { z } from 'zod';
import { Stack, Alert } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { TextInput } from '@/components/mantine/TextInput';
import { Textarea } from '@/components/mantine/Textarea';
import { AppDatePicker } from '@/components/mantine/DatePicker';
import { Button, Group } from '@mantine/core';
import { toDate } from '@/utils/normalize';
import { useZodForm } from '@/hooks/useZodForm';
import { calculateAgeFromDate } from '@/utils/ageCalculator';

const participantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  birth_date: z
    .date({ required_error: 'Birth date is required' })
    .max(new Date(), 'Birth date cannot be in the future'),
  notes: z.string().optional(),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onAddParticipant?: (participant: any) => Promise<void>;
  initialData?: Partial<ParticipantFormData>;
  title?: string;
  classSchedule?: {
    classes: {
      min_age?: number;
      max_age?: number;
      name: string;
    };
  };
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
  const form = useZodForm(participantSchema, {
    first_name: initialData?.first_name ?? '',
    birth_date: toDate(initialData?.birth_date) ?? null,
    notes: initialData?.notes ?? '',
  });

  useEffect(() => {
    if (initialData) {
      form.setValues({
        first_name: initialData.first_name ?? '',
        birth_date: toDate(initialData.birth_date) ?? null,
        notes: initialData.notes ?? '',
      });
    }
  }, [initialData, form]);

  // Calculate age from birth date
  const age = form.values.birth_date
    ? calculateAgeFromDate(form.values.birth_date)
    : null;

  // Check if age is outside class range
  const isOutOfRange = 
    age !== null && 
    classSchedule?.classes && 
    ((classSchedule.classes.min_age && age < classSchedule.classes.min_age) ||
     (classSchedule.classes.max_age && age > classSchedule.classes.max_age));

  const handleSubmit = async (data: ParticipantFormData) => {
    // Convert to ISO string only at submission time
    const { notes, ...rest } = data;
    const payload = {
      ...rest,
      birth_date: data.birth_date.toISOString(),
      notes: notes || undefined,
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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Child's First Name"
            placeholder="Enter child's first name"
            {...form.getInputProps('first_name')}
            withAsterisk
          />

          <AppDatePicker
            withAsterisk
            label="Birth Date"
            placeholder="Select birth date"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps('birth_date')}
          />

          {isOutOfRange && classSchedule?.classes && (
            <Alert color="yellow" radius="md">
              This child is outside the recommended age range 
              ({classSchedule.classes.min_age}–{classSchedule.classes.max_age}). 
              You can still save the participant, but coaches may move them to a different class.
            </Alert>
          )}

          <Textarea
            label="Notes (Optional)"
            placeholder="Any special notes about this child..."
            rows={3}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" gap="sm" mt="lg">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={form.submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.submitting}
              disabled={!form.isValid()}
              data-autofocus
            >
              Save Participant
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default ParticipantModal;
