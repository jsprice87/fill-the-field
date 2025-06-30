
import { useState, useRef, useCallback } from 'react';

export interface MapState {
  validLocations: any[];
  isLoading: boolean;
  error: string;
  mapError: string;
  debugInfo: string[];
  browserInfo: string[];
  mapInitialized: boolean;
  containerReady: boolean;
  useFallbackMap: boolean;
  leafletValid: boolean;
  validationIssues: string[];
  initializationStep: string;
}

export const useMapState = () => {
  const [validLocations, setValidLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mapError, setMapError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [browserInfo, setBrowserInfo] = useState<string[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [leafletValid, setLeafletValid] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [initializationStep, setInitializationStep] = useState<string>('starting');
  const isMountedRef = useRef(true);

  // Add debug logging function
  const addDebugLog = useCallback((message: string) => {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗺️ MAP DEBUG: ${message}`);
    }
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Add browser info logging
  const addBrowserInfo = useCallback((message: string) => {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 BROWSER DEBUG: ${message}`);
    }
    setBrowserInfo(prev => [...prev.slice(-9), message]);
  }, []);

  // Safe state update function
  const safeSetState = useCallback((updateFn: () => void) => {
    if (isMountedRef.current) {
      updateFn();
    }
  }, []);

  const state: MapState = {
    validLocations,
    isLoading,
    error,
    mapError,
    debugInfo,
    browserInfo,
    mapInitialized,
    containerReady,
    useFallbackMap,
    leafletValid,
    validationIssues,
    initializationStep
  };

  const actions = {
    setValidLocations,
    setIsLoading,
    setError,
    setMapError,
    setMapInitialized,
    setContainerReady,
    setUseFallbackMap,
    setLeafletValid,
    setValidationIssues,
    setInitializationStep,
    addDebugLog,
    addBrowserInfo,
    safeSetState,
    isMountedRef
  };

  return { state, actions };
};
