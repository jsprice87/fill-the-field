
import React from 'react';
import { Link } from 'react-router-dom';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/admin/settings/global" className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-gray-50 transition-colors">
          <h3 className="font-medium text-lg">Global Settings</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Configure system-wide settings and defaults for all franchisees.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminSettings;
