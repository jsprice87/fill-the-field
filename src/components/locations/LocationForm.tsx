
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Switch } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { FormWrapper } from '@/components/mantine/FormWrapper';
import { TextInput } from '@/components/mantine/TextInput';
import { geocodeAddress } from '@/utils/geocoding';
import { toast } from 'sonner';
import { toErrorNode } from '@/lib/toErrorNode';

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
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      isActive: true,
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
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

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={initialData?.id ? 'Edit Location' : 'Add Location'}
      size="lg"
    >
      <FormProvider {...form}>
        <FormWrapper
          onSubmit={form.handleSubmit(handleSubmit)}
          onCancel={onClose}
          submitLabel={initialData?.id ? 'Update Location' : 'Add Location'}
          isLoading={form.formState.isSubmitting}
        >
          <Stack gap="md">
            <TextInput
              label="Location Name"
              placeholder="Enter location name"
              {...form.register('name')}
              error={toErrorNode(form.formState.errors.name?.message)}
              required
            />

            <TextInput
              label="Address"
              placeholder="Enter street address"
              {...form.register('address')}
              error={toErrorNode(form.formState.errors.address?.message)}
              required
            />

            <Stack gap="sm">
              <TextInput
                label="City"
                placeholder="Enter city"
                {...form.register('city')}
                error={toErrorNode(form.formState.errors.city?.message)}
                required
              />

              <TextInput
                label="State"
                placeholder="Enter state"
                {...form.register('state')}
                error={toErrorNode(form.formState.errors.state?.message)}
                required
              />

              <TextInput
                label="ZIP Code"
                placeholder="Enter ZIP code"
                {...form.register('zip')}
                error={toErrorNode(form.formState.errors.zip?.message)}
                required
              />
            </Stack>

            <TextInput
              label="Phone"
              placeholder="Enter phone number (optional)"
              {...form.register('phone')}
              error={toErrorNode(form.formState.errors.phone?.message)}
            />

            <TextInput
              label="Email"
              placeholder="Enter email address (optional)"
              type="email"
              {...form.register('email')}
              error={toErrorNode(form.formState.errors.email?.message)}
            />

            <Switch
              label="Active Location"
              description="Location is available for booking"
              checked={form.watch('isActive')}
              onChange={(event) => form.setValue('isActive', event.currentTarget.checked)}
              color="soccerGreen"
              size="md"
            />
          </Stack>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
};

export default LocationForm;
