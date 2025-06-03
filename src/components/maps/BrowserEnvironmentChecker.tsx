
import React, { useEffect } from 'react';
import L from 'leaflet';

interface BrowserEnvironmentCheckerProps {
  onReport: (info: string) => void;
}

const BrowserEnvironmentChecker: React.FC<BrowserEnvironmentCheckerProps> = ({ onReport }) => {
  useEffect(() => {
    // Check if we're in browser environment
    const isBrowser = typeof window !== 'undefined';
    onReport(`Browser environment: ${isBrowser}`);
    
    if (isBrowser) {
      // Check Leaflet availability
      onReport(`Leaflet available: ${typeof L !== 'undefined'}`);
      onReport(`Leaflet version: ${L.version || 'unknown'}`);
      
      // Check React-Leaflet components availability by checking if they exist on window
      const hasReactLeaflet = typeof window !== 'undefined' && 
        document.querySelector('script[src*="react-leaflet"]') !== null ||
        window.React !== undefined; // Basic check
      onReport(`React-Leaflet context available: ${hasReactLeaflet}`);
      
      // Check CSS loading
      const leafletCSS = document.querySelector('link[href*="leaflet"], style[data-styled*="leaflet"]');
      onReport(`Leaflet CSS loaded: ${!!leafletCSS}`);
      
      // Check for any existing leaflet containers
      const existingContainers = document.querySelectorAll('.leaflet-container');
      onReport(`Existing leaflet containers: ${existingContainers.length}`);
      
      // Check window dimensions
      onReport(`Window size: ${window.innerWidth}x${window.innerHeight}`);
      
      // Check if container will have dimensions
      setTimeout(() => {
        const mapContainers = document.querySelectorAll('.leaflet-container');
        onReport(`Map containers found: ${mapContainers.length}`);
        mapContainers.forEach((container, index) => {
          const rect = container.getBoundingClientRect();
          onReport(`Container ${index} dimensions: ${rect.width}x${rect.height}`);
        });
      }, 100);
    }
  }, [onReport]);
  
  return null;
};

export default BrowserEnvironmentChecker;
