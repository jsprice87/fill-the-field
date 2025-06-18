
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Switch, Text } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { FormWrapper } from '@/components/mantine/FormWrapper';
import { TextInput } from '@/components/mantine/TextInput';
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
      // Attempt to geocode the address
      const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`;
      const coordinates = await geocodeAddress(fullAddress);
      
      if (coordinates) {
        data.latitude = coordinates.latitude;
        data.longitude = coordinates.longitude;
      }
      
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
              error={form.formState.errors.name?.message ? <Text size="sm" c="red">{form.formState.errors.name.message}</Text> : false}
              required
            />

            <TextInput
              label="Address"
              placeholder="Enter street address"
              {...form.register('address')}
              error={form.formState.errors.address?.message ? <Text size="sm" c="red">{form.formState.errors.address.message}</Text> : false}
              required
            />

            <Stack gap="sm">
              <TextInput
                label="City"
                placeholder="Enter city"
                {...form.register('city')}
                error={form.formState.errors.city?.message ? <Text size="sm" c="red">{form.formState.errors.city.message}</Text> : false}
                required
              />

              <TextInput
                label="State"
                placeholder="Enter state"
                {...form.register('state')}
                error={form.formState.errors.state?.message ? <Text size="sm" c="red">{form.formState.errors.state.message}</Text> : false}
                required
              />

              <TextInput
                label="ZIP Code"
                placeholder="Enter ZIP code"
                {...form.register('zip')}
                error={form.formState.errors.zip?.message ? <Text size="sm" c="red">{form.formState.errors.zip.message}</Text> : false}
                required
              />
            </Stack>

            <TextInput
              label="Phone"
              placeholder="Enter phone number (optional)"
              {...form.register('phone')}
              error={form.formState.errors.phone?.message ? <Text size="sm" c="red">{form.formState.errors.phone.message}</Text> : false}
            />

            <TextInput
              label="Email"
              placeholder="Enter email address (optional)"
              type="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message ? <Text size="sm" c="red">{form.formState.errors.email.message}</Text> : false}
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
