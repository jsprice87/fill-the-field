
import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your dashboard</p>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Quick Stats</h2>
          <p className="text-muted-foreground mt-2">Your summary at a glance</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <p className="text-muted-foreground mt-2">Your latest actions</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-muted-foreground mt-2">Important updates</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
