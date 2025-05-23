
import React from 'react';

const AdminGlobalSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Global Settings</h1>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <h3 className="font-medium text-lg">System Configuration</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="system-name" className="text-sm font-medium">System Name</label>
              <input id="system-name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="SuperLeadStar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalSettings;
