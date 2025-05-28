import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from '@/layouts/DashboardLayout';
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
import PublicLayout from '@/layouts/PublicLayout';
import LandingPage from '@/pages/LandingPage';
import BookingPage from '@/pages/BookingPage';
import BookingConfirmation from '@/pages/BookingConfirmation';
import BookingReschedule from '@/pages/BookingReschedule';
import BookingCancellation from '@/pages/BookingCancellation';
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
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/book/:franchiseeSlug" element={<PublicLayout><BookingPage /></PublicLayout>} />
          <Route path="/booking-confirmation" element={<PublicLayout><BookingConfirmation /></PublicLayout>} />
          <Route path="/booking-reschedule" element={<PublicLayout><BookingReschedule /></PublicLayout>} />
          <Route path="/booking-cancellation" element={<PublicLayout><BookingCancellation /></PublicLayout>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
