import React, { useState } from 'react';
import { z } from 'zod';
import { Stack, Switch, Group, Button, Grid } from '@mantine/core';
import { TextInput } from '@/components/mantine/TextInput';
import { useZodForm } from '@/hooks/useZodForm';
import { toast } from 'sonner';
import { useUpdateLocation } from '@/hooks/useLocationActions';
import { Edit, Save, X } from 'lucide-react';

// Extended schema with contact fields for Bug #40
const locationDetailsSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: z.string().optional(),
  email: z.string().optional().refine((val) => !val || val === '' || z.string().email().safeParse(val).success, {
    message: 'Invalid email format'
  }),
  // Contact fields for Bug #40 - will be added to database later
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
  path: ['latitude']
});

export type LocationDetailsData = z.infer<typeof locationDetailsSchema>;

interface LocationDetailsFormProps {
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string | null;
    email: string | null;
    contact_name: string | null;
    contact_email: string | null;
    is_active: boolean;
    latitude: number | null;
    longitude: number | null;
  };
  onLocationUpdated: (updatedLocation: any) => void;
}

const LocationDetailsForm: React.FC<LocationDetailsFormProps> = ({
  location,
  onLocationUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateLocationMutation = useUpdateLocation();
  
  const form = useZodForm(locationDetailsSchema, {
    id: location.id,
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state,
    zip: location.zip,
    phone: location.phone || '',
    email: location.email || '',
    // Contact fields from Bug #40
    contact_name: location.contact_name || '',
    contact_email: location.contact_email || '',
    isActive: location.is_active,
    autoCalculateCoordinates: true,
    latitude: location.latitude || undefined,
    longitude: location.longitude || undefined,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form to original values
    form.setValues({
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zip: location.zip,
      phone: location.phone || '',
      email: location.email || '',
      contact_name: location.contact_name || '',
      contact_email: location.contact_email || '',
      isActive: location.is_active,
      autoCalculateCoordinates: true,
      latitude: location.latitude || undefined,
      longitude: location.longitude || undefined,
    });
    setIsEditing(false);
  };

  const handleSubmit = async (data: LocationDetailsData) => {
    setIsSubmitting(true);
    try {
      // Include contact fields for Bug #40
      const updateData = {
        id: data.id,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone || null,
        email: data.email || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        isActive: data.isActive,
        autoCalculateCoordinates: data.autoCalculateCoordinates,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      await updateLocationMutation.mutateAsync(updateData);
      
      // Update the parent component with new data
      onLocationUpdated({
        ...location,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone || null,
        email: data.email || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        is_active: data.isActive,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      });
      
      setIsEditing(false);
      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitHandler = form.onSubmit(handleSubmit);

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <Group justify="space-between" align="flex-start" mb="md">
          <div className="flex-1">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Location Name</div>
                    <div className="text-base">{location.name}</div>
                  </div>
                </Grid.Col>
                <Grid.Col span={6}>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                    <div className={`text-base ${location.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {location.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </Grid.Col>
              </Grid>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
                <div className="text-base">{location.address}</div>
                <div className="text-base">{location.city}, {location.state} {location.zip}</div>
              </div>
              
              <Grid>
                <Grid.Col span={6}>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Phone</div>
                    <div className="text-base">{location.phone || 'Not provided'}</div>
                  </div>
                </Grid.Col>
                <Grid.Col span={6}>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                    <div className="text-base">{location.email || 'Not provided'}</div>
                  </div>
                </Grid.Col>
              </Grid>
              
              {(location.latitude && location.longitude) && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Coordinates</div>
                  <div className="text-sm font-mono">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </Stack>
          </div>
          <Button variant="outline" onClick={handleEdit} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Location
          </Button>
        </Group>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <form onSubmit={onSubmitHandler}>
        <Stack gap="md">
          <Group justify="space-between" align="center" mb="md">
            <h3 className="text-lg font-medium">Edit Location Details</h3>
            <Group gap="sm">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!form.isValid()}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </Group>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Location Name"
                placeholder="Enter location name"
                withAsterisk
                disabled={isSubmitting}
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                label="Active Location"
                description="Location is available for booking"
                color="soccerGreen"
                size="md"
                disabled={isSubmitting}
                {...form.getInputProps('isActive', { type: 'checkbox' })}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Address"
            placeholder="Enter street address"
            withAsterisk
            disabled={isSubmitting}
            {...form.getInputProps('address')}
          />

          <Grid>
            <Grid.Col span={4}>
              <TextInput
                label="City"
                placeholder="Enter city"
                withAsterisk
                disabled={isSubmitting}
                {...form.getInputProps('city')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="State"
                placeholder="Enter state"
                withAsterisk
                disabled={isSubmitting}
                {...form.getInputProps('state')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="ZIP Code"
                placeholder="Enter ZIP code"
                withAsterisk
                disabled={isSubmitting}
                {...form.getInputProps('zip')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Phone"
                placeholder="Enter phone number (optional)"
                disabled={isSubmitting}
                {...form.getInputProps('phone')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Email"
                placeholder="Enter email address (optional)"
                type="email"
                disabled={isSubmitting}
                {...form.getInputProps('email')}
              />
            </Grid.Col>
          </Grid>

          {/* Contact fields for Bug #40 - now enabled with database support */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium mb-3">Location Contact Person</h4>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Contact Name"
                  placeholder="Primary contact person name (optional)"
                  disabled={isSubmitting}
                  {...form.getInputProps('contact_name')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Contact Email"
                  placeholder="Primary contact email (optional)"
                  type="email"
                  disabled={isSubmitting}
                  {...form.getInputProps('contact_email')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <div className="border-t pt-4">
            <Switch
              label="Auto-calculate Coordinates"
              description="Automatically geocode address to get latitude/longitude"
              color="blue"
              size="md"
              disabled={isSubmitting}
              {...form.getInputProps('autoCalculateCoordinates', { type: 'checkbox' })}
            />

            {!form.values.autoCalculateCoordinates && (
              <Grid mt="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="Latitude"
                    placeholder="Enter latitude (e.g., 39.7392)"
                    type="number"
                    step="any"
                    disabled={isSubmitting}
                    {...form.getInputProps('latitude')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Longitude"
                    placeholder="Enter longitude (e.g., -104.9903)"
                    type="number"
                    step="any"
                    disabled={isSubmitting}
                    {...form.getInputProps('longitude')}
                  />
                </Grid.Col>
              </Grid>
            )}
          </div>
        </Stack>
      </form>
    </div>
  );
};

export default LocationDetailsForm;