import React from 'react';
import { Button, Stack, Group, Text, ActionIcon } from '@mantine/core';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface LocationMapProps {
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    latitude: number | null;
    longitude: number | null;
  };
}

const LocationMap: React.FC<LocationMapProps> = ({ location }) => {
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  
  // Generate Google Maps and Apple Maps URLs
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`;
  
  // If we have coordinates, use them for more precise links
  const googleMapsCoordUrl = location.latitude && location.longitude 
    ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    : googleMapsUrl;
  
  const appleMapsCoordUrl = location.latitude && location.longitude
    ? `https://maps.apple.com/?ll=${location.latitude},${location.longitude}&q=${encodeURIComponent(location.name)}`
    : appleMapsUrl;

  const openInGoogleMaps = () => {
    window.open(googleMapsCoordUrl, '_blank');
  };

  const openInAppleMaps = () => {
    window.open(appleMapsCoordUrl, '_blank');
  };

  const getDirections = () => {
    // Default to Google Maps for directions
    const directionsUrl = location.latitude && location.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
    
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <Stack gap="md">
        {/* Map placeholder */}
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <Text size="sm" c="dimmed" mb="xs">
              Interactive map coming soon
            </Text>
            <Text size="xs" c="dimmed">
              Use the buttons below to view in external maps
            </Text>
          </div>
        </div>

        {/* Location details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <Group align="flex-start" gap="sm">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <Text fw={500} size="sm" mb="xs">
                {location.name}
              </Text>
              <Text size="sm" c="dimmed">
                {fullAddress}
              </Text>
              {location.latitude && location.longitude && (
                <Text size="xs" c="dimmed" family="monospace" mt="xs">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              )}
            </div>
          </Group>
        </div>

        {/* Action buttons */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Button
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              leftSection={<ExternalLink className="h-4 w-4" />}
            >
              Google Maps
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInAppleMaps}
              leftSection={<ExternalLink className="h-4 w-4" />}
            >
              Apple Maps
            </Button>
          </Group>
          <Button
            variant="filled"
            size="sm"
            onClick={getDirections}
            leftSection={<Navigation className="h-4 w-4" />}
          >
            Get Directions
          </Button>
        </Group>

        {!location.latitude || !location.longitude ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <Text size="sm" c="orange">
              <strong>Note:</strong> No coordinates available for this location. 
              Map links will use the address for approximate positioning.
            </Text>
          </div>
        ) : null}
      </Stack>
    </div>
  );
};

export default LocationMap;