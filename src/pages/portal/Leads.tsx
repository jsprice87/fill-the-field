
import React from 'react';

const PortalLeads: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
      </div>
      <div className="rounded-md border">
        <div className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">No leads found yet. When users sign up through your landing page, they'll appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default PortalLeads;
