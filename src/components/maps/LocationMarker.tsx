
import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';

interface LocationMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  classDays?: string[];
  timeOfDay?: string;
  ageRange?: string;
}

interface LocationMarkerProps {
  location: LocationMarkerData;
  franchiseeSlug: string;
  flowId?: string;
  onLocationSelect: (location: any) => void;
}

const createCustomMarker = () => {
  return new DivIcon({
    html: `
      <div class="custom-marker">
        <div class="marker-circle"></div>
      </div>
    `,
    className: 'custom-marker-container',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const LocationMarker: React.FC<LocationMarkerProps> = ({
  location,
  franchiseeSlug,
  flowId,
  onLocationSelect
}) => {
  const navigate = useNavigate();

  const handleMarkerClick = () => {
    const locationData = {
      id: location.id,
      name: location.name,
      address: location.address
    };
    onLocationSelect(locationData);
  };

  const formatDays = (days?: string[]) => {
    if (!days || days.length === 0) return 'Contact for schedule';
    return days.join(', ');
  };

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={createCustomMarker()}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} className="location-tooltip">
        <div className="font-poppins">
          <div className="font-semibold text-brand-navy mb-1">{location.name}</div>
          <div className="text-sm text-gray-600 mb-1">
            <strong>Days:</strong> {formatDays(location.classDays)}
          </div>
          {location.timeOfDay && (
            <div className="text-sm text-gray-600 mb-1">
              <strong>Times:</strong> {location.timeOfDay}
            </div>
          )}
          {location.ageRange && (
            <div className="text-sm text-gray-600">
              <strong>Ages:</strong> {location.ageRange}
            </div>
          )}
          <div className="text-xs text-brand-blue mt-2 font-medium">
            Click to select location
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
};

export default LocationMarker;
