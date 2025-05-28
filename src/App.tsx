
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/dashboard/DashboardLayout';
import PortalDashboard from '@/pages/portal/Dashboard';
import PortalLeads from '@/pages/portal/Leads';
import PortalBookings from '@/pages/portal/Bookings';
import Classes from '@/pages/portal/Classes';
import AddClasses from '@/pages/portal/AddClasses';
import EditClass from '@/pages/portal/EditClass';
import ClassesList from '@/pages/portal/ClassesList';
import Locations from '@/pages/portal/Locations';
import Profile from '@/pages/portal/Profile';
import PortalSettings from '@/pages/portal/Settings';
import LeadDetail from '@/pages/portal/LeadDetail';

function App() {
  const { isLoggedIn } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Portal Routes */}
          <Route path="/portal" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<PortalDashboard />} />
            <Route path="dashboard" element={<PortalDashboard />} />
            <Route path="leads" element={<PortalLeads />} />
            <Route path="leads/:leadId" element={<LeadDetail />} />
            <Route path="bookings" element={<PortalBookings />} />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/add" element={<AddClasses />} />
            <Route path="classes/edit/:id" element={<EditClass />} />
            <Route path="classes/list" element={<ClassesList />} />
            <Route path="locations" element={<Locations />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<PortalSettings />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/portal/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
