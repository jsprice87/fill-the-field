
import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
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
      
      // Check React-Leaflet components
      onReport(`MapContainer available: ${typeof MapContainer !== 'undefined'}`);
      onReport(`TileLayer available: ${typeof TileLayer !== 'undefined'}`);
      
      // Check CSS loading
      const leafletCSS = document.querySelector('link[href*="leaflet"]');
      onReport(`Leaflet CSS loaded: ${!!leafletCSS}`);
      
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
