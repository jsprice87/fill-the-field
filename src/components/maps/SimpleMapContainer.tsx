
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { AspectRatio } from '@mantine/core';

interface SimpleMapContainerProps {
  height?: string;
  aspectRatio?: number; // width/height ratio, e.g., 1 for square, 16/9 for widescreen
  className?: string;
  children: React.ReactNode;
  onContainerReady: (ready: boolean) => void;
  addDebugLog: (message: string) => void;
}

const SimpleMapContainer: React.FC<SimpleMapContainerProps> = ({
  height,
  aspectRatio,
  className = "",
  children,
  onContainerReady,
  addDebugLog
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const checkAndInitContainer = useCallback(() => {
    if (!containerRef.current) {
      addDebugLog('Container ref is null');
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    addDebugLog(`Container dimensions: ${rect.width}x${rect.height}`);
    
    // Ensure container has proper dimensions
    if (rect.width > 0 && rect.height > 0) {
      addDebugLog('Container ready with valid dimensions');
      setIsReady(true);
      onContainerReady(true);
    } else {
      addDebugLog('Container dimensions invalid, retrying...');
      // Single retry after a short delay
      setTimeout(() => {
        if (containerRef.current) {
          const retryRect = containerRef.current.getBoundingClientRect();
          addDebugLog(`Retry container dimensions: ${retryRect.width}x${retryRect.height}`);
          if (retryRect.width > 0 && retryRect.height > 0) {
            setIsReady(true);
            onContainerReady(true);
          } else {
            addDebugLog('Container failed to get valid dimensions');
            onContainerReady(false);
          }
        }
      }, 100);
    }
  }, [addDebugLog, onContainerReady]);

  useEffect(() => {
    addDebugLog('SimpleMapContainer mounted');
    // Check container after mount
    const timer = setTimeout(checkAndInitContainer, 10);
    return () => clearTimeout(timer);
  }, [checkAndInitContainer, addDebugLog]);

  // If aspectRatio is provided, use AspectRatio component
  if (aspectRatio) {
    return (
      <AspectRatio ratio={aspectRatio} className={`rounded-lg overflow-hidden border ${className}`}>
        <div 
          ref={containerRef} 
          className="relative w-full h-full"
          style={{ minHeight: '300px' }}
        >
          {isReady ? children : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Preparing map...</p>
              </div>
            </div>
          )}
        </div>
      </AspectRatio>
    );
  }

  // Fallback to height-based container
  return (
    <div 
      style={{ height: height || '400px', minHeight: '300px' }} 
      className={`rounded-lg overflow-hidden border ${className}`}
    >
      <div 
        ref={containerRef} 
        style={{ height: '100%', width: '100%' }}
        className="relative"
      >
        {isReady ? children : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Preparing map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMapContainer;
