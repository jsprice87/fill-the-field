
import React from 'react';

const AdminUserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="rounded-md border">
        <div className="p-6">
          <p className="text-muted-foreground">No franchisees found. When users sign up, they'll appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
