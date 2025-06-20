import React from 'react';
import { Card } from '@mantine/core';
import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@mantine/core';

interface MapErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const MapErrorFallback: React.FC<MapErrorFallbackProps> = ({ 
  error = "Map failed to load", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <Card className="border-yellow-200 bg-yellow-50 h-full flex items-center justify-center">
      <Card.Section className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-yellow-600 mr-2" />
          <AlertCircle className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="font-agrandir text-lg text-yellow-800 mb-2">
          Map Unavailable
        </h3>
        <p className="font-poppins text-yellow-700 mb-4 max-w-md">
          {error}. You can still view and select locations from the list below.
        </p>
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            Retry Map
          </Button>
        )}
      </Card.Section>
    </Card>
  );
};

export default MapErrorFallback;
