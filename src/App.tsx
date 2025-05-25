import React from "react";
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
import SlugResolver from "./components/auth/SlugResolver";
import MigrateUserUrls from "./components/auth/MigrateUserUrls";

// Portal (Franchisee) Pages
import PortalDashboard from "./pages/portal/Dashboard";
import PortalLocations from "./pages/portal/Locations";
import ClassesList from "./pages/portal/ClassesList";
import AddClasses from "./pages/portal/AddClasses";
import EditClass from "./pages/portal/EditClass";
import PortalLeads from "./pages/portal/Leads";
import PortalSettings from "./pages/portal/Settings";
import UserProfile from "./pages/portal/Profile";

// Booking Flow Pages (Public)
import BookingLanding from "./pages/booking/BookingLanding";
import FindClasses from "./pages/booking/FindClasses";
import ClassBooking from "./pages/booking/ClassBooking";
import BookingConfirmation from "./pages/booking/BookingConfirmation";
import ThankYou from "./pages/booking/ThankYou";
import SpanishInfo from "./pages/booking/SpanishInfo";

// Legacy Landing Pages (Public)
import LandingPage from "./pages/landing/LandingPage";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* This component will automatically migrate UUID URLs to slug URLs */}
          <MigrateUserUrls />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<Register />} />
            <Route path="/register" element={<Register />} />
            
            {/* Redirect /dashboard to the proper route */}
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* New Booking Flow - Public Routes */}
            <Route path="/:franchiseeId/free-trial" element={
              <SlugResolver>
                <BookingLanding />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/free-trial/find-classes" element={
              <SlugResolver>
                <FindClasses />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/free-trial/booking" element={
              <SlugResolver>
                <ClassBooking />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/free-trial/booking/:bookingId" element={
              <SlugResolver>
                <BookingConfirmation />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/free-trial/thank-you/:bookingId" element={
              <SlugResolver>
                <ThankYou />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/free-trial/spanish-info" element={
              <SlugResolver>
                <SpanishInfo />
              </SlugResolver>
            } />
            
            {/* Legacy Public Landing Pages - Accessible without login */}
            <Route path="/:franchiseeId/landing-page" element={
              <SlugResolver>
                <LandingPage />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/landing-page/find-classes" element={
              <SlugResolver>
                <FindClasses />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/landing-page/contact-us" element={
              <SlugResolver>
                <ContactUs />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/landing-page/book-a-class" element={
              <SlugResolver>
                <BookClass />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/landing-page/confirmation" element={
              <SlugResolver>
                <Confirmation />
              </SlugResolver>
            } />
            <Route path="/:franchiseeId/landing-page/spanish-speaking" element={
              <SlugResolver>
                <SpanishLanding />
              </SlugResolver>
            } />
            
            {/* Protected Franchisee Routes */}
            <Route 
              path="/:franchiseeId/portal" 
              element={
                <ProtectedRoute>
                  <SlugResolver>
                    <DashboardLayout />
                  </SlugResolver>
                </ProtectedRoute>
              }
            >
              <Route index element={<PortalDashboard />} />
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="locations" element={<PortalLocations />} />
              <Route path="classes" element={<ClassesList />} />
              <Route path="classes/add" element={<AddClasses />} />
              <Route path="classes/edit/:classId" element={<EditClass />} />
              <Route path="leads" element={<PortalLeads />} />
              <Route path="settings" element={<PortalSettings />} />
            </Route>
            
            <Route 
              path="/:franchiseeId/profile" 
              element={
                <ProtectedRoute>
                  <SlugResolver>
                    <UserProfile />
                  </SlugResolver>
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
};

export default App;
