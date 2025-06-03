
import { useCallback } from 'react';

interface MapErrorHandlerProps {
  addDebugLog: (message: string) => void;
  safeSetState: (updateFn: () => void) => void;
  setMapError: (error: string) => void;
  setUseFallbackMap: (useFallback: boolean) => void;
  setInitializationStep: (step: string) => void;
  setError: (error: string) => void;
  setMapInitialized: (initialized: boolean) => void;
  setContainerReady: (ready: boolean) => void;
  setLeafletValid: (valid: boolean) => void;
  setValidationIssues: (issues: string[]) => void;
  processLocations: () => void;
}

export const useMapErrorHandler = ({
  addDebugLog,
  safeSetState,
  setMapError,
  setUseFallbackMap,
  setInitializationStep,
  setError,
  setMapInitialized,
  setContainerReady,
  setLeafletValid,
  setValidationIssues,
  processLocations
}: MapErrorHandlerProps) => {

  const handleMapError = useCallback((errorMessage: string) => {
    addDebugLog(`Map error occurred: ${errorMessage}`);
    console.error('Map error:', errorMessage);
    addDebugLog('Switching to fallback map');
    safeSetState(() => {
      setMapError(errorMessage);
      setUseFallbackMap(true);
      setInitializationStep('fallback-active');
    });
  }, [addDebugLog, safeSetState, setMapError, setUseFallbackMap, setInitializationStep]);

  const retryMapLoad = useCallback(() => {
    addDebugLog('Retrying map load');
    safeSetState(() => {
      setMapError('');
      setError('');
      setUseFallbackMap(false);
      setMapInitialized(false);
      setContainerReady(false);
      setLeafletValid(false);
      setValidationIssues([]);
      setInitializationStep('retrying');
    });
    processLocations();
  }, [addDebugLog, safeSetState, setMapError, setError, setUseFallbackMap, setMapInitialized, setContainerReady, setLeafletValid, setValidationIssues, setInitializationStep, processLocations]);

  const handleLeafletValidation = useCallback((isValid: boolean, issues: string[]) => {
    addDebugLog(`Leaflet validation result: ${isValid ? 'VALID' : 'INVALID'}`);
    if (issues.length > 0) {
      addDebugLog(`Validation issues: ${issues.join(', ')}`);
    }
    
    setLeafletValid(isValid);
    setValidationIssues(issues);
    setInitializationStep(isValid ? 'leaflet-valid' : 'leaflet-invalid');
    
    if (!isValid) {
      // If Leaflet validation fails, switch to fallback immediately
      addDebugLog('Leaflet validation failed, switching to fallback map');
      setUseFallbackMap(true);
      setError(`Leaflet validation failed: ${issues.join(', ')}`);
    }
  }, [addDebugLog, setLeafletValid, setValidationIssues, setInitializationStep, setUseFallbackMap, setError]);

  return {
    handleMapError,
    retryMapLoad,
    handleLeafletValidation
  };
};
