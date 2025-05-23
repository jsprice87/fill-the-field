
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

// Portal (Franchisee) Pages
import PortalDashboard from "./pages/portal/Dashboard";
import PortalLocations from "./pages/portal/Locations";
import PortalClasses from "./pages/portal/Classes";
import PortalLeads from "./pages/portal/Leads";
import PortalSettings from "./pages/portal/Settings";
import UserProfile from "./pages/portal/Profile";

// Landing Pages (Public)
import LandingPage from "./pages/landing/LandingPage";
import FindClasses from "./pages/landing/FindClasses";
import ContactUs from "./pages/landing/ContactUs";
import BookClass from "./pages/landing/BookClass";
import Confirmation from "./pages/landing/Confirmation";
import SpanishLanding from "./pages/landing/SpanishLanding";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminTransactions from "./pages/admin/Transactions";
import AdminSettings from "./pages/admin/Settings";
import AdminGlobalSettings from "./pages/admin/GlobalSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<Register />} />
          
          {/* Redirect /dashboard to the proper route */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Public Landing Pages - Accessible without login */}
          <Route path="/:franchiseeId/landing-page" element={<LandingPage />} />
          <Route path="/:franchiseeId/landing-page/find-classes" element={<FindClasses />} />
          <Route path="/:franchiseeId/landing-page/contact-us" element={<ContactUs />} />
          <Route path="/:franchiseeId/landing-page/book-a-class" element={<BookClass />} />
          <Route path="/:franchiseeId/landing-page/confirmation" element={<Confirmation />} />
          <Route path="/:franchiseeId/landing-page/spanish-speaking" element={<SpanishLanding />} />
          
          {/* Protected Franchisee Routes */}
          <Route 
            path="/:franchiseeId/portal" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PortalDashboard />} />
            <Route path="dashboard" element={<PortalDashboard />} />
            <Route path="locations" element={<PortalLocations />} />
            <Route path="classes" element={<PortalClasses />} />
            <Route path="leads" element={<PortalLeads />} />
            <Route path="settings" element={<PortalSettings />} />
          </Route>
          
          <Route 
            path="/:franchiseeId/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="user-management" element={<AdminUserManagement />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/global" element={<AdminGlobalSettings />} />
          </Route>

          {/* Catch-all 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
