
import React from 'react';

interface MapDebuggerProps {
  debugInfo: string[];
  browserInfo: string[];
  validLocations: any[];
  locations: any[];
  containerReady: boolean;
  mapInitialized: boolean;
  className?: string;
}

const MapDebugger: React.FC<MapDebuggerProps> = ({
  debugInfo,
  browserInfo,
  validLocations,
  locations,
  containerReady,
  mapInitialized,
  className = ""
}) => {
  return (
    <div className={`absolute bottom-2 left-2 bg-black bg-opacity-90 text-white text-xs p-3 rounded max-w-sm max-h-48 overflow-y-auto ${className}`}>
      <div className="font-bold mb-1">🗺️ Map Debug Status:</div>
      <div>Container Ready: {containerReady ? '✅' : '❌'}</div>
      <div>Map Initialized: {mapInitialized ? '✅' : '❌'}</div>
      <div>Locations: {validLocations.length}</div>
      <div className="mt-2 font-bold">Recent Logs:</div>
      {debugInfo.slice(-3).map((info, i) => <div key={i} className="truncate">{info}</div>)}
      <div className="mt-2 font-bold">Browser:</div>
      {browserInfo.slice(-2).map((info, i) => <div key={i} className="truncate">{info}</div>)}
    </div>
  );
};

export default MapDebugger;
