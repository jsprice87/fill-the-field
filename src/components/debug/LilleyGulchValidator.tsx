import React, { useState } from 'react';
import { Button, Card, Stack, Group, Text, Alert, Loader, Code } from '@mantine/core';
import { IconMapPin, IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';
import { validateLilleyGulchCoordinates, generateCoordinateUpdateSQL } from '@/utils/coordinateCorrection';

interface CorrectionResult {
  locationName: string;
  needsCorrection: boolean;
  currentCoordinates?: { lat: number; lng: number };
  suggestedCoordinates?: { lat: number; lng: number };
  distanceDifference?: number;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

export const LilleyGulchValidator: React.FC = () => {
  const [validationResult, setValidationResult] = useState<CorrectionResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 Starting Lilley Gulch validation...');
      const result = await validateLilleyGulchCoordinates();
      setValidationResult(result);
      console.log('✅ Validation complete:', result);
    } catch (error) {
      console.error('❌ Validation error:', error);
      setValidationResult({
        locationName: 'Lilley Gulch Soccer Fields',
        needsCorrection: false,
        message: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 'low'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getAlertColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'green';
      case 'medium': return 'yellow';
      case 'low': return 'red';
      default: return 'gray';
    }
  };

  const getAlertIcon = (needsCorrection: boolean, confidence: string) => {
    if (!needsCorrection) return <IconCheck size={16} />;
    if (confidence === 'medium') return <IconAlertTriangle size={16} />;
    return <IconX size={16} />;
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
          {isValidating ? 'Validating Location...' : 'Validate Lilley Gulch Coordinates'}
        </Button>

        {validationResult && (
          <Alert
            icon={getAlertIcon(validationResult.needsCorrection, validationResult.confidence)}
            title={!validationResult.needsCorrection ? 'Coordinates Validated' : 'Coordinate Issues Found'}
            color={getAlertColor(validationResult.confidence)}
            radius="md"
          >
            <Stack gap="sm">
              <Text>{validationResult.message}</Text>
              
              {validationResult.currentCoordinates && (
                <div>
                  <Text size="sm" fw={500}>Current Database Coordinates:</Text>
                  <Code>
                    Lat: {validationResult.currentCoordinates.lat.toFixed(7)}, 
                    Lng: {validationResult.currentCoordinates.lng.toFixed(7)}
                  </Code>
                </div>
              )}

              {validationResult.suggestedCoordinates && (
                <div>
                  <Text size="sm" fw={500}>Suggested (Corrected) Coordinates:</Text>
                  <Code>
                    Lat: {validationResult.suggestedCoordinates.lat.toFixed(7)}, 
                    Lng: {validationResult.suggestedCoordinates.lng.toFixed(7)}
                  </Code>
                </div>
              )}

              {validationResult.distanceDifference && (
                <div>
                  <Text size="sm" fw={500}>Distance Difference:</Text>
                  <Code>{validationResult.distanceDifference.toFixed(3)} miles</Code>
                </div>
              )}

              <Text size="sm" c="dimmed">
                Confidence: {validationResult.confidence.toUpperCase()}
              </Text>
              
              {validationResult.currentCoordinates && validationResult.suggestedCoordinates && (
                <>
                  <Text size="sm" fw={500}>Quick Links to Verify:</Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="outline"
                      component="a"
                      href={`https://www.google.com/maps/@${validationResult.currentCoordinates.lat},${validationResult.currentCoordinates.lng},15z`}
                      target="_blank"
                    >
                      View Current Location
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      component="a"
                      href={`https://www.google.com/maps/@${validationResult.suggestedCoordinates.lat},${validationResult.suggestedCoordinates.lng},15z`}
                      target="_blank"
                    >
                      View Suggested Location
                    </Button>
                  </Group>
                </>
              )}

              {validationResult.needsCorrection && validationResult.suggestedCoordinates && (
                <div>
                  <Text size="sm" fw={500}>SQL Update Command:</Text>
                  <Code block>
                    {generateCoordinateUpdateSQL(
                      validationResult.locationName,
                      validationResult.suggestedCoordinates.lat,
                      validationResult.suggestedCoordinates.lng
                    )}
                  </Code>
                </div>
              )}
            </Stack>
          </Alert>
        )}

        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Debug Information"
          color="blue"
          radius="md"
        >
          <Stack gap="xs">
            <Text size="sm">
              <strong>Expected Address:</strong> 6063 S Independence St, Littleton, CO 80123
            </Text>
            <Text size="sm">
              <strong>Current DB Coordinates:</strong> 39.5384674, -105.1058995
            </Text>
            <Text size="sm">
              <strong>Issue:</strong> Location showing up in wrong part of town
            </Text>
            <Text size="sm" c="dimmed">
              Check browser console for detailed geocoding logs during validation.
            </Text>
          </Stack>
        </Alert>
      </Stack>
    </Card>
  );
};