
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
  const [retryCount, setRetryCount] = useState(0);

  // Check container dimensions with retry logic
  const checkContainer = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const computedStyle = getComputedStyle(containerRef.current);
      
      addDebugLog(`Container check #${retryCount + 1}: ${rect.width}x${rect.height}`);
      addDebugLog(`Container computed height: ${computedStyle.height}`);
      addDebugLog(`Container parent: ${containerRef.current.parentElement?.tagName || 'none'}`);
      
      const ready = rect.width > 0 && rect.height > 0;
      
      if (ready) {
        addDebugLog('Container is ready!');
        setContainerReady(true);
        onContainerReady(true);
      } else if (retryCount < 10) {
        addDebugLog(`Container not ready, retrying... (attempt ${retryCount + 1}/10)`);
        setRetryCount(prev => prev + 1);
        setTimeout(checkContainer, 200);
      } else {
        addDebugLog('Container failed to become ready after 10 attempts, proceeding anyway');
        setContainerReady(true);
        onContainerReady(false);
      }
    } else {
      addDebugLog('Container ref is null');
    }
  }, [addDebugLog, onContainerReady, retryCount]);

  useEffect(() => {
    addDebugLog('MapContainerWrapper mounted, starting container checks');
    
    // Check immediately
    setTimeout(checkContainer, 10);
    
    // Also check on window resize
    const handleResize = () => {
      addDebugLog('Window resized, rechecking container');
      checkContainer();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkContainer, addDebugLog]);

  return (
    <div style={{ height }} className={`rounded-lg overflow-hidden border ${className}`}>
      <div 
        ref={containerRef} 
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        className="relative"
      >
        {containerReady ? (
          <div className="h-full w-full">
            {children}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Preparing map container...</p>
              <div className="mt-2 text-xs text-gray-500">
                <div>Container ready: {containerReady ? 'Yes' : 'No'}</div>
                <div>Check attempts: {retryCount}/10</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapContainerWrapper;
