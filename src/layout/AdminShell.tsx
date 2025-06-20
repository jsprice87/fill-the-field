
import React from 'react';

interface AdminShellProps {
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  return <>{children}</>;
};

export default AdminShell;
