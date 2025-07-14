import React, { useState } from 'react';
import { Stack, Switch, Group, Button, Grid } from '@mantine/core';
import { TextInput } from '@/components/mantine/TextInput';
import { toast } from 'sonner';
import { useUpdateLocation } from '@/hooks/useLocationActions';
import { Save } from 'lucide-react';

// Simple interface without validation
export interface LocationDetailsData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact_name: string;
  contact_email: string;
  isActive: boolean;
  autoCalculateCoordinates: boolean;
  latitude?: number;
  longitude?: number;
}

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
  onLocationUpdated: (updatedLocation: LocationDetailsFormProps['location']) => void;
}

const LocationDetailsForm: React.FC<LocationDetailsFormProps> = ({
  location,
  onLocationUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateLocationMutation = useUpdateLocation();
  
  // Simple state management - no validation
  const [formData, setFormData] = useState({
    id: location.id,
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state,
    zip: location.zip,
    contact_name: location.contact_name || '',
    contact_email: location.contact_email || '',
    isActive: location.is_active,
    autoCalculateCoordinates: true,
    latitude: location.latitude || undefined,
    longitude: location.longitude || undefined,
  });
  
  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Always save - no validation blocking
      const updateData = {
        id: formData.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        phone: null, // Remove phone field entirely
        email: null, // Remove email field entirely
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        isActive: formData.isActive,
        autoCalculateCoordinates: formData.autoCalculateCoordinates,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      await updateLocationMutation.mutateAsync(updateData);
      
      // Update the parent component with new data
      onLocationUpdated({
        ...location,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        phone: null,
        email: null,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        is_active: formData.isActive,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      });
      
      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Always show editable form - no more modal-like behavior
  return (
    <div className="bg-white rounded-lg border p-6">
      <Stack gap="md">
        <Group justify="space-between" align="center" mb="md">
          <h3 className="text-lg font-medium">Location Details</h3>
          <Button
            onClick={handleSave}
            loading={isSubmitting}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Location Name"
              placeholder="Enter location name"
              disabled={isSubmitting}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Switch
              label="Active Location"
              description="Location is available for booking"
              color="soccerGreen"
              size="md"
              disabled={isSubmitting}
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Address"
          placeholder="Enter street address"
          disabled={isSubmitting}
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />

        <Grid>
          <Grid.Col span={4}>
            <TextInput
              label="City"
              placeholder="Enter city"
              disabled={isSubmitting}
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="State"
              placeholder="Enter state"
              disabled={isSubmitting}
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="ZIP Code"
              placeholder="Enter ZIP code"
              disabled={isSubmitting}
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
            />
          </Grid.Col>
        </Grid>

        {/* Only Contact fields - no duplicate email/phone */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-3">Location Contact Person</h4>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Contact Name"
                placeholder="Primary contact person name (optional)"
                disabled={isSubmitting}
                value={formData.contact_name}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Contact Email"
                placeholder="Primary contact email (optional)"
                type="email"
                disabled={isSubmitting}
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
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
            checked={formData.autoCalculateCoordinates}
            onChange={(e) => handleInputChange('autoCalculateCoordinates', e.target.checked)}
          />

          {!formData.autoCalculateCoordinates && (
            <Grid mt="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Latitude"
                  placeholder="Enter latitude (e.g., 39.7392)"
                  type="number"
                  step="any"
                  disabled={isSubmitting}
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Longitude"
                  placeholder="Enter longitude (e.g., -104.9903)"
                  type="number"
                  step="any"
                  disabled={isSubmitting}
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </Grid.Col>
            </Grid>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default LocationDetailsForm;