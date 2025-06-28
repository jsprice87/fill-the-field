
import React, { useEffect, useState } from 'react';
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
import DateSelector from './DateSelector';

// Fixed schema to use Date type for birth_date
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
  onSubmit: (data: ParticipantFormData) => void;
  onAddParticipant?: (participant: ParticipantFormData) => Promise<void>;
  initialData?: Partial<ParticipantFormData>;
  title?: string;
  classSchedule?: {
    id: string;
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  
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

  // Fixed birth date change handler - convert string to Date
  const handleBirthDateChange = (value: string | null) => {
    console.log('birthDate raw', value, typeof value);
    const dateValue = value ? new Date(value) : null;
    form.setFieldValue('birth_date', dateValue);
  };

  // Calculate age from birth date - with null safety
  const age = form.values.birth_date && form.values.birth_date instanceof Date
    ? calculateAgeFromDate(form.values.birth_date)
    : null;

  // Check if age is outside class range
  const isOutOfRange = 
    age !== null && 
    classSchedule?.classes && 
    ((classSchedule.classes.min_age && age < classSchedule.classes.min_age) ||
     (classSchedule.classes.max_age && age > classSchedule.classes.max_age));

  const handleSubmit = async (data: ParticipantFormData) => {
    if (!selectedDate) {
      alert('Please select a class date');
      return;
    }

    // Convert Date to ISO string and prepare participant data
    const participantData = {
      id: crypto.randomUUID(),
      firstName: data.first_name,
      lastName: '', // Will be handled by parent form
      age: age || 0,
      birthDate: data.birth_date instanceof Date 
        ? data.birth_date.toISOString().split('T')[0] 
        : null,
      classScheduleId: classSchedule?.id || '',
      className: classSchedule?.classes.name || '',
      classTime: '', // Will be filled from schedule
      selectedDate: selectedDate,
      healthConditions: data.notes || undefined,
      ageOverride: isOutOfRange || false
    };

    console.log('Submitting participant with payload:', participantData);
    console.log('form.isValid', form.isValid());

    if (onAddParticipant) {
      await onAddParticipant(participantData);
    } else {
      onSubmit(participantData);
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
            value={form.values.birth_date ? form.values.birth_date.toISOString().split('T')[0] : ''}
            onChange={handleBirthDateChange}
            error={form.errors.birth_date}
          />

          {isOutOfRange && classSchedule?.classes && (
            <Alert color="yellow" radius="md">
              This child is outside the recommended age range 
              ({classSchedule.classes.min_age}–{classSchedule.classes.max_age}). 
              You can still save the participant, but coaches may move them to a different class.
            </Alert>
          )}

          {classSchedule && (
            <DateSelector
              classScheduleId={classSchedule.id}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
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
              disabled={!form.isValid() || form.submitting || !selectedDate}
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
