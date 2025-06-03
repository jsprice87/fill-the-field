
import React from 'react';

interface MapDebugPanelProps {
  debugInfo: string[];
  browserInfo: string[];
  validLocations: any[];
  locations: any[];
  containerReady: boolean;
  mapInitialized: boolean;
  initializationStep: string;
  leafletValid: boolean;
  useFallbackMap: boolean;
}

const MapDebugPanel: React.FC<MapDebugPanelProps> = ({
  debugInfo,
  browserInfo,
  validLocations,
  locations,
  containerReady,
  mapInitialized,
  initializationStep,
  leafletValid,
  useFallbackMap
}) => {
  return (
    <>
      {/* Enhanced debug info overlay */}
      <div className="absolute bottom-16 left-2 bg-blue-900 bg-opacity-90 text-white text-xs p-2 rounded max-w-xs">
        <div className="font-bold">🔧 Init Status:</div>
        <div>Step: {initializationStep}</div>
        <div>Leaflet: {leafletValid ? '✅' : '❌'}</div>
        <div>Container: {containerReady ? '✅' : '❌'}</div>
        <div>Map: {mapInitialized ? '✅' : '❌'}</div>
        <div>Fallback: {useFallbackMap ? '🔄' : '❌'}</div>
      </div>
    </>
  );
};

export default MapDebugPanel;
