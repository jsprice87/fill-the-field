
import { useCallback } from 'react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

interface MapDataProcessorProps {
  locations: Location[];
  addDebugLog: (message: string) => void;
  safeSetState: (updateFn: () => void) => void;
  setValidLocations: (locations: Location[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setInitializationStep: (step: string) => void;
}

export const useMapDataProcessor = ({
  locations,
  addDebugLog,
  safeSetState,
  setValidLocations,
  setIsLoading,
  setError,
  setInitializationStep
}: MapDataProcessorProps) => {
  
  const processLocations = useCallback(() => {
    addDebugLog(`Processing ${locations?.length || 0} locations`);
    setInitializationStep('processing-locations');
    
    if (!locations || locations.length === 0) {
      addDebugLog('No locations to process');
      safeSetState(() => {
        setValidLocations([]);
        setIsLoading(false);
        setInitializationStep('no-locations');
      });
      return;
    }

    addDebugLog(`Input locations: ${JSON.stringify(locations.map(l => ({ id: l.id, name: l.name, lat: l.latitude, lng: l.longitude })))}`);
    
    safeSetState(() => {
      setIsLoading(true);
      setError('');
    });

    // Filter locations that have valid coordinates
    const locationsWithCoords = locations.filter(location => {
      const isValid = location && 
        typeof location.id === 'string' && 
        typeof location.name === 'string' && 
        typeof location.address === 'string' &&
        typeof location.city === 'string' &&
        typeof location.state === 'string' &&
        typeof location.zip === 'string' &&
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        !isNaN(location.latitude) &&
        !isNaN(location.longitude) &&
        isFinite(location.latitude) &&
        isFinite(location.longitude);
      
      if (!isValid) {
        addDebugLog(`Invalid location: ${location?.name || 'unknown'} - lat: ${location?.latitude}, lng: ${location?.longitude}`);
      }
      
      return isValid;
    });

    addDebugLog(`Found ${locationsWithCoords.length} valid locations out of ${locations.length} total`);

    if (locationsWithCoords.length === 0) {
      const errorMsg = `No locations have coordinates yet. Please edit your locations to refresh their addresses.`;
      addDebugLog(`Setting error: ${errorMsg}`);
      safeSetState(() => {
        setError(errorMsg);
        setValidLocations([]);
        setIsLoading(false);
        setInitializationStep('no-valid-locations');
      });
      return;
    }

    safeSetState(() => {
      setValidLocations(locationsWithCoords);
      setIsLoading(false);
      setInitializationStep('locations-processed');
    });
  }, [locations, addDebugLog, safeSetState, setValidLocations, setIsLoading, setError, setInitializationStep]);

  return { processLocations };
};
