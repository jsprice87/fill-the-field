
import React, { useEffect } from 'react';
import { z } from 'zod';
import { Stack, Switch, Group, Button } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { TextInput } from '@/components/mantine/TextInput';
import { useZodForm } from '@/hooks/useZodForm';
import { geocodeAddress } from '@/utils/geocoding';
import { toast } from 'sonner';

const locationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  isActive: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LocationFormData) => Promise<void>;
  initialData?: LocationFormData;
}

const LocationForm: React.FC<LocationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const form = useZodForm(locationSchema, {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    isActive: true,
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      form.setValues(initialData);
    } else {
      form.setValues({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        isActive: true,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: LocationFormData) => {
    try {
      // Build Location object for geocoding
      const locationData = {
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip
      };
      
      const coordinates = await geocodeAddress(locationData);
      
      if (coordinates) {
        data.latitude = coordinates.latitude;
        data.longitude = coordinates.longitude;
      }
      
      // Pass the complete data object with all form fields
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting location:', error);
      toast.error('Failed to save location. Please try again.');
    }
  };

  const onSubmitHandler = form.onSubmit(handleSubmit);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={initialData?.id ? 'Edit Location' : 'Add Location'}
      size="lg"
    >
      <form onSubmit={onSubmitHandler}>
        <Stack gap="md">
          <TextInput
            label="Location Name"
            placeholder="Enter location name"
            withAsterisk
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Address"
            placeholder="Enter street address"
            withAsterisk
            {...form.getInputProps('address')}
          />

          <Stack gap="sm">
            <TextInput
              label="City"
              placeholder="Enter city"
              withAsterisk
              {...form.getInputProps('city')}
            />

            <TextInput
              label="State"
              placeholder="Enter state"
              withAsterisk
              {...form.getInputProps('state')}
            />

            <TextInput
              label="ZIP Code"
              placeholder="Enter ZIP code"
              withAsterisk
              {...form.getInputProps('zip')}
            />
          </Stack>

          <TextInput
            label="Phone"
            placeholder="Enter phone number (optional)"
            {...form.getInputProps('phone')}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address (optional)"
            type="email"
            {...form.getInputProps('email')}
          />

          <Switch
            label="Active Location"
            description="Location is available for booking"
            color="soccerGreen"
            size="md"
            {...form.getInputProps('isActive', { type: 'checkbox' })}
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
              {initialData?.id ? 'Update Location' : 'Add Location'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default LocationForm;
