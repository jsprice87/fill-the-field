
import React from 'react';

const AdminTransactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="rounded-md border">
        <div className="p-6">
          <p className="text-muted-foreground">No transactions found.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
