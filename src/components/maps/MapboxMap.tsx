
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

interface MapboxMapProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  className?: string;
  aspectRatio?: number; // width/height ratio, e.g., 1 for square, 16/9 for widescreen
  mapboxToken: string;
  addDebugLog: (message: string) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  locations,
  onLocationSelect,
  className = "",
  aspectRatio = 1, // Default to square
  mapboxToken,
  addDebugLog
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Calculate center from locations - return tuple [lng, lat]
  const calculateCenter = (): [number, number] => {
    const validLocations = locations.filter(loc => 
      loc.latitude && loc.longitude && 
      !isNaN(loc.latitude) && !isNaN(loc.longitude)
    );

    if (validLocations.length === 0) {
      return [-104.9903, 39.7392]; // Denver default
    }

    const centerLng = validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / validLocations.length;
    const centerLat = validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / validLocations.length;

    return [centerLng, centerLat];
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      addDebugLog('Missing map container or Mapbox token');
      return;
    }

    addDebugLog('Initializing Mapbox map...');
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      const center = calculateCenter();
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Simple, clean style
        center: center,
        zoom: locations.length > 1 ? 10 : 12,
        attributionControl: false
      });

      // Add simple navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        addDebugLog('Mapbox map loaded successfully');
        setIsMapReady(true);
        addMarkers();
      });

      map.current.on('error', (e) => {
        addDebugLog(`Mapbox error: ${e.error?.message || 'Unknown error'}`);
      });

    } catch (error) {
      addDebugLog(`Failed to initialize Mapbox: ${error}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, addDebugLog]);

  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const validLocations = locations.filter(loc => 
      loc.latitude && loc.longitude && 
      !isNaN(loc.latitude) && !isNaN(loc.longitude)
    );

    addDebugLog(`Adding ${validLocations.length} markers to Mapbox map`);

    validLocations.forEach(location => {
      const marker = new mapboxgl.Marker({
        color: '#ef4444' // Red color matching brand
      })
        .setLngLat([location.longitude!, location.latitude!])
        .addTo(map.current!);

      // Create popup with location info
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'location-hover-popup'
      }).setHTML(`
        <div class="p-3">
          <h3 class="font-bold text-sm text-gray-900">${location.name}</h3>
          <p class="text-xs text-gray-600 mt-1">${location.address}</p>
          <p class="text-xs text-gray-600">${location.city}, ${location.state}</p>
          <p class="text-xs text-blue-600 mt-2 font-medium">Click to select this location</p>
        </div>
      `);

      marker.setPopup(popup);

      const markerElement = marker.getElement();
      let hoverTimeout: NodeJS.Timeout;

      // Add hover functionality
      markerElement.addEventListener('mouseenter', () => {
        // Clear any existing timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        // Show popup with slight delay to prevent flickering
        hoverTimeout = setTimeout(() => {
          popup.addTo(map.current!);
        }, 100);
        
        // Add hover styling
        markerElement.style.transform = 'scale(1.1)';
        markerElement.style.transition = 'transform 0.2s ease';
        markerElement.style.cursor = 'pointer';
      });

      markerElement.addEventListener('mouseleave', () => {
        // Clear timeout if mouse leaves before popup shows
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        // Hide popup
        popup.remove();
        
        // Reset hover styling
        markerElement.style.transform = 'scale(1)';
      });

      // Add click handler for location selection
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        addDebugLog(`Marker clicked: ${location.name}`);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      });

      markers.current.push(marker);
    });

    // Fit map to markers if multiple locations
    if (validLocations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validLocations.forEach(loc => {
        bounds.extend([loc.longitude!, loc.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  useEffect(() => {
    if (isMapReady) {
      addMarkers();
    }
  }, [locations, isMapReady]);

  return (
    <AspectRatio ratio={aspectRatio} className={className}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg border border-gray-200"
        style={{ minHeight: '300px' }}
      />
      <style>{`
        .location-hover-popup .mapboxgl-popup-content {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          padding: 0;
          max-width: 250px;
        }
        
        .location-hover-popup .mapboxgl-popup-tip {
          border-top-color: #e5e7eb;
        }
      `}</style>
    </AspectRatio>
  );
};

export default MapboxMap;
