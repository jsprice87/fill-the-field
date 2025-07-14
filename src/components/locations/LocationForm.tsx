
import React, { useEffect } from 'react';
import { z } from 'zod';
import { Stack, Switch, Group, Button } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { TextInput } from '@/components/mantine/TextInput';
import { useZodForm } from '@/hooks/useZodForm';
import { toast } from 'sonner';

const locationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: z.string().optional(),
  email: z.string().optional().refine((val) => !val || val === '' || z.string().email().safeParse(val).success, {
    message: 'Invalid email format'
  }),
  contact_name: z.string().optional(),
  contact_email: z.string().optional().refine((val) => !val || val === '' || z.string().email().safeParse(val).success, {
    message: 'Invalid contact email format'
  }),
  isActive: z.boolean(),
  autoCalculateCoordinates: z.boolean().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine((data) => {
  // If auto-calculate is disabled, require manual coordinates
  if (!data.autoCalculateCoordinates) {
    return data.latitude !== undefined && data.longitude !== undefined;
  }
  return true;
}, {
  message: 'Latitude and longitude are required when auto-calculate is disabled',
  path: ['latitude'] // Show error on latitude field
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useZodForm(locationSchema, {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    contact_name: '',
    contact_email: '',
    isActive: true,
    autoCalculateCoordinates: true,
    ...initialData,
  });

  useEffect(() => {
    if (open) {
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
          contact_name: '',
          contact_email: '',
          isActive: true,
          autoCalculateCoordinates: true,
        });
      }
      setIsSubmitting(false);
    }
  }, [initialData, open]);

  const handleSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      // Pass form data as-is - let the hooks handle geocoding
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting location:', error);
      toast.error('Failed to save location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const onSubmitHandler = form.onSubmit(handleSubmit);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={initialData?.id ? 'Edit Location' : 'Add Location'}
      size="lg"
      data-testid="add-location-modal"
    >
      <form onSubmit={onSubmitHandler}>
        <Stack gap="md">
          <TextInput
            label="Location Name"
            placeholder="Enter location name"
            withAsterisk
            disabled={isSubmitting}
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Address"
            placeholder="Enter street address"
            withAsterisk
            disabled={isSubmitting}
            {...form.getInputProps('address')}
          />

          <Stack gap="sm">
            <TextInput
              label="City"
              placeholder="Enter city"
              withAsterisk
              disabled={isSubmitting}
              {...form.getInputProps('city')}
            />

            <TextInput
              label="State"
              placeholder="Enter state"
              withAsterisk
              disabled={isSubmitting}
              {...form.getInputProps('state')}
            />

            <TextInput
              label="ZIP Code"
              placeholder="Enter ZIP code"
              withAsterisk
              disabled={isSubmitting}
              {...form.getInputProps('zip')}
            />
          </Stack>

          <TextInput
            label="Phone"
            placeholder="Enter phone number (optional)"
            disabled={isSubmitting}
            {...form.getInputProps('phone')}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address (optional)"
            type="email"
            disabled={isSubmitting}
            {...form.getInputProps('email')}
          />

          {/* Contact fields for Bug #40 */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium mb-3">Location Contact Person</h4>
            <Group grow>
              <TextInput
                label="Contact Name"
                placeholder="Primary contact person name (optional)"
                disabled={isSubmitting}
                {...form.getInputProps('contact_name')}
              />
              <TextInput
                label="Contact Email"
                placeholder="Primary contact email (optional)"
                type="email"
                disabled={isSubmitting}
                {...form.getInputProps('contact_email')}
              />
            </Group>
          </div>

          <Switch
            label="Active Location"
            description="Location is available for booking"
            color="soccerGreen"
            size="md"
            disabled={isSubmitting}
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />

          <Switch
            label="Auto-calculate Coordinates"
            description="Automatically geocode address to get latitude/longitude"
            color="blue"
            size="md"
            disabled={isSubmitting}
            {...form.getInputProps('autoCalculateCoordinates', { type: 'checkbox' })}
          />

          {!form.values.autoCalculateCoordinates && (
            <Stack gap="sm">
              <TextInput
                label="Latitude"
                placeholder="Enter latitude (e.g., 39.7392)"
                type="number"
                step="any"
                disabled={isSubmitting}
                {...form.getInputProps('latitude')}
              />
              <TextInput
                label="Longitude"
                placeholder="Enter longitude (e.g., -104.9903)"
                type="number"
                step="any"
                disabled={isSubmitting}
                {...form.getInputProps('longitude')}
              />
            </Stack>
          )}

          <Group justify="flex-end" gap="sm" mt="lg">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
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
