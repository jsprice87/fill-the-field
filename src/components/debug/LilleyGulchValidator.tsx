import React, { useState } from 'react';
import { Button, Card, Stack, Group, Text, Alert, Loader, Code } from '@mantine/core';
import { IconMapPin, IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';
import { geocodeAddress } from '@/utils/geocoding';

interface GeocodingResult {
  locationName: string;
  coordinates?: { lat: number; lng: number };
  success: boolean;
  message: string;
}

export const LilleyGulchValidator: React.FC = () => {
  const [validationResult, setValidationResult] = useState<GeocodingResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 Testing Lilley Gulch geocoding...');
      const result = await geocodeAddress({
        address: '6063 S Independence St',
        city: 'Littleton', 
        state: 'CO',
        zip: '80123',
        name: 'Lilley Gulch Soccer Fields'
      }, true); // Force fresh lookup
      
      if (result) {
        setValidationResult({
          locationName: 'Lilley Gulch Soccer Fields',
          coordinates: { lat: result.latitude, lng: result.longitude },
          success: true,
          message: `Geocoding successful! Found coordinates: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`
        });
      } else {
        setValidationResult({
          locationName: 'Lilley Gulch Soccer Fields',
          success: false,
          message: 'Geocoding failed - no coordinates found for this address'
        });
      }
      console.log('✅ Geocoding test complete:', result);
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      setValidationResult({
        locationName: 'Lilley Gulch Soccer Fields',
        success: false,
        message: `Error during geocoding: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getAlertColor = (success: boolean) => {
    return success ? 'green' : 'red';
  };

  const getAlertIcon = (success: boolean) => {
    return success ? <IconCheck size={16} /> : <IconX size={16} />;
  };

  return (
    <Card withBorder padding="lg" style={{ margin: '20px', maxWidth: '800px' }}>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconMapPin size={20} />
            <Text size="lg" fw={600}>Lilley Gulch Location Validator</Text>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          This tool validates the coordinates for Lilley Gulch Soccer Fields (6063 S Independence St, Littleton, CO 80123)
          against fresh geocoding results to identify positioning issues.
        </Text>

        <Button
          onClick={handleValidation}
          loading={isValidating}
          leftSection={isValidating ? <Loader size="xs" /> : <IconMapPin size={16} />}
          disabled={isValidating}
        >
          {isValidating ? 'Testing Geocoding...' : 'Test Lilley Gulch Geocoding'}
        </Button>

        {validationResult && (
          <Alert
            icon={getAlertIcon(validationResult.success)}
            title={validationResult.success ? 'Geocoding Successful' : 'Geocoding Failed'}
            color={getAlertColor(validationResult.success)}
            radius="md"
          >
            <Stack gap="sm">
              <Text>{validationResult.message}</Text>
              
              {validationResult.coordinates && (
                <div>
                  <Text size="sm" fw={500}>Geocoded Coordinates:</Text>
                  <Code>
                    Lat: {validationResult.coordinates.lat.toFixed(7)}, 
                    Lng: {validationResult.coordinates.lng.toFixed(7)}
                  </Code>
                </div>
              )}

              {validationResult.coordinates && (
                <>
                  <Text size="sm" fw={500}>Verify Location:</Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="outline"
                      component="a"
                      href={`https://www.google.com/maps/@${validationResult.coordinates.lat},${validationResult.coordinates.lng},15z`}
                      target="_blank"
                    >
                      View on Google Maps
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      component="a"
                      href={`https://www.openstreetmap.org/#map=15/${validationResult.coordinates.lat}/${validationResult.coordinates.lng}`}
                      target="_blank"
                    >
                      View on OpenStreetMap
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </Alert>
        )}

        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Test Information"
          color="blue"
          radius="md"
        >
          <Stack gap="xs">
            <Text size="sm">
              <strong>Test Address:</strong> 6063 S Independence St, Littleton, CO 80123
            </Text>
            <Text size="sm">
              <strong>Location Name:</strong> Lilley Gulch Soccer Fields
            </Text>
            <Text size="sm">
              <strong>Purpose:</strong> Test that geocoding returns accurate coordinates for this address
            </Text>
            <Text size="sm" c="dimmed">
              Check browser console for detailed geocoding logs during testing.
            </Text>
          </Stack>
        </Alert>
      </Stack>
    </Card>
  );
};