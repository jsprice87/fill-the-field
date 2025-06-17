
import React from 'react';
import { Stack, Button, Group } from '@mantine/core';
import { useFormContext } from 'react-hook-form';

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  submitDisabled?: boolean;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  isLoading = false,
  submitDisabled = false,
}) => {
  const form = useFormContext();

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="md">
        {children}
        
        <Group justify="flex-end" gap="sm" mt="lg">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            loading={isLoading}
            disabled={submitDisabled || (form && !form.formState.isValid)}
            data-autofocus
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
