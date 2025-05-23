
import React from 'react';

const PortalLocations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Add Location
        </button>
      </div>
      <div className="rounded-md border">
        <div className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">No locations found. Add your first location to get started.</p>
        </div>
      </div>
    </div>
  );
};

export default PortalLocations;
