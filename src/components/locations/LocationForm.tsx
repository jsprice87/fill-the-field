
import React, { useEffect } from 'react';
import { z } from 'zod';
import { Stack, Switch, Group, Button } from '@mantine/core';
import { Modal } from '@/components/mantine/Modal';
import { TextInput } from '@/components/mantine/TextInput';
import { useZodForm } from '@/hooks/useZodForm';
import { geocodeAddress, clearGeocodeCache } from '@/utils/geocoding';
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
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
    if (open) {
      if (initialData) {
        console.log('LocationForm: Setting initial data', initialData);
        form.setValues(initialData);
      } else {
        console.log('LocationForm: Setting empty form values');
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
      setIsSubmitting(false);
    }
  }, [initialData, open, form]);

  const handleSubmit = async (data: LocationFormData) => {
    console.log('LocationForm: Form submission started', data);
    console.log('LocationForm: Form validation state', {
      isValid: form.isValid(),
      errors: form.errors,
      values: form.values
    });
    
    setIsSubmitting(true);
    try {
      // Build Location object for geocoding - always force fresh lookup
      const locationData = {
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        name: data.name
      };
      
      console.log('LocationForm: Geocoding location data', locationData);
      const coordinates = await geocodeAddress(locationData, true); // Force fresh lookup
      
      if (coordinates) {
        console.log('LocationForm: Geocoding successful', coordinates);
        data.latitude = coordinates.latitude;
        data.longitude = coordinates.longitude;
      } else {
        console.warn('LocationForm: Geocoding failed, proceeding without coordinates');
        toast.warning('Could not determine coordinates for this address. Location saved without map positioning.');
      }
      
      // Pass the complete data object with all form fields
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting location:', error);
      toast.error('Failed to save location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceRecalculate = () => {
    clearGeocodeCache();
    toast.info('Coordinate cache cleared. Next save will recalculate coordinates.');
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

          <Switch
            label="Active Location"
            description="Location is available for booking"
            color="soccerGreen"
            size="md"
            disabled={isSubmitting}
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />

          {/* Debug info when form is invalid */}
          {!form.isValid() && Object.keys(form.errors).length > 0 && (
            <div style={{ padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px', fontSize: '12px' }}>
              <strong>Form validation errors:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                {Object.entries(form.errors).map(([field, error]) => (
                  <li key={field}>{field}: {error}</li>
                ))}
              </ul>
            </div>
          )}

          <Group justify="space-between" gap="sm" mt="lg">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceRecalculate}
              disabled={isSubmitting}
            >
              Clear Coordinate Cache
            </Button>
            
            <Group gap="sm">
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
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default LocationForm;
