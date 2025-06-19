
import React from 'react';

interface LocationsMapProps {
  locations: any[];
  loading: boolean;
  error: any;
  onRetry: () => void;
  selectedLocationId?: string;
}

// TODO: real implementation
export function LocationsMap({ 
  locations, 
  loading, 
  error, 
  onRetry, 
  selectedLocationId 
}: LocationsMapProps) { 
  return null; 
}

export default LocationsMap;
