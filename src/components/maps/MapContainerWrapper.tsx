
import React, { useRef, useEffect, useCallback, useState } from 'react';

interface MapContainerWrapperProps {
  height: string;
  className?: string;
  children: React.ReactNode;
  onContainerReady: (ready: boolean) => void;
  addDebugLog: (message: string) => void;
}

const MapContainerWrapper: React.FC<MapContainerWrapperProps> = ({
  height,
  className = "",
  children,
  onContainerReady,
  addDebugLog
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);

  // Check container dimensions
  useEffect(() => {
    const checkContainer = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        addDebugLog(`Container dimensions: ${rect.width}x${rect.height}`);
        addDebugLog(`Container computed style height: ${getComputedStyle(containerRef.current).height}`);
        const ready = rect.width > 0 && rect.height > 0;
        setContainerReady(ready);
        onContainerReady(ready);
      }
    };

    checkContainer();
    const timer = setTimeout(checkContainer, 100);
    return () => clearTimeout(timer);
  }, [addDebugLog, onContainerReady]);

  return (
    <div style={{ height }} className={`rounded-lg overflow-hidden border ${className}`}>
      <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
        {containerReady ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Preparing map container...</p>
              <div className="mt-2 text-xs text-gray-500">
                Container ready: {containerReady ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapContainerWrapper;
