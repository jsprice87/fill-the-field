
import { HomeIcon, UserIcon, SettingsIcon, CalendarIcon, MapPinIcon, BookOpenIcon, UsersIcon, CreditCardIcon, BarChart3Icon, ShieldIcon, HelpCircleIcon } from "lucide-react";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import PortalDashboard from "./pages/portal/Dashboard";
import PortalLeads from "./pages/portal/Leads";
import LeadDetail from "./pages/portal/LeadDetail";
import PortalBookings from "./pages/portal/Bookings";
import PortalLocations from "./pages/portal/Locations";
import PortalClasses from "./pages/portal/Classes";
import AddClasses from "./pages/portal/AddClasses";
import EditClass from "./pages/portal/EditClass";
import PortalProfile from "./pages/portal/Profile";
import PortalSettings from "./pages/portal/Settings";
import PortalHelp from "./pages/portal/Help";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminTransactions from "./pages/admin/Transactions";
import AdminGlobalSettings from "./pages/admin/GlobalSettings";
import AdminSettings from "./pages/admin/Settings";
import SpanishLanding from "./pages/landing/SpanishLanding";
import FindClasses from "./pages/landing/FindClasses";
import BookClass from "./pages/landing/BookClass";
import Confirmation from "./pages/landing/Confirmation";
import ContactUs from "./pages/landing/ContactUs";
import BookingLanding from "./pages/booking/BookingLanding";
import BookingFindClasses from "./pages/booking/FindClasses";
import ClassBooking from "./pages/booking/ClassBooking";
import BookingConfirmation from "./pages/booking/BookingConfirmation";
import ThankYou from "./pages/booking/ThankYou";
import SpanishInfo from "./pages/booking/SpanishInfo";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SlugResolver from "./components/auth/SlugResolver";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DefaultBookingRedirect from "./pages/booking/DefaultBookingRedirect";
import PortalRedirect from "./components/auth/PortalRedirect";
import { Navigate } from "react-router-dom";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Login",
    to: "/login",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Login />,
  },
  {
    title: "Register",
    to: "/register",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Register />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  // Portal redirects - these redirect to slug-based URLs
  {
    title: "Portal Dashboard Redirect",
    to: "/portal/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Leads Redirect",
    to: "/portal/leads",
    icon: <UsersIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Lead Detail Redirect",
    to: "/portal/leads/:leadId",
    icon: <UserIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Bookings Redirect",
    to: "/portal/bookings",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Locations Redirect",
    to: "/portal/locations",
    icon: <MapPinIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Classes Redirect",
    to: "/portal/classes",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Add Classes Redirect",
    to: "/portal/classes/add",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Edit Class Redirect",
    to: "/portal/classes/edit/:classId",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Profile Redirect",
    to: "/portal/profile",
    icon: <UserIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  {
    title: "Portal Settings Redirect",
    to: "/portal/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <ProtectedRoute><PortalRedirect /></ProtectedRoute>,
  },
  // Admin routes (these stay as-is since they don't use slugs)
  {
    title: "Admin Dashboard",
    to: "/admin/dashboard",
    icon: <BarChart3Icon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin User Management",
    to: "/admin/user-management",
    icon: <UsersIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin Transactions",
    to: "/admin/transactions",
    icon: <CreditCardIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin Global Settings",
    to: "/admin/settings/global",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin Settings",
    to: "/admin/settings",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
  },
  // Add the new default booking redirect route BEFORE the slug-based routes
  {
    title: "Default Free Trial Redirect",
    to: "/free-trial",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <DefaultBookingRedirect />,
  },
  // Legacy landing page redirect - redirects /:franchiseeSlug to /:franchiseeSlug/free-trial
  {
    title: "Legacy Landing Page Redirect",
    to: "/:franchiseeSlug",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><Navigate to="free-trial" replace /></SlugResolver>,
  },
  // Franchisee slug-based portal routes - NESTED STRUCTURE
  {
    title: "Franchisee Portal",
    to: "/:franchiseeSlug/portal",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout /></ProtectedRoute></SlugResolver>,
    children: [
      {
        title: "Portal Dashboard",
        to: "",
        index: true,
        icon: <HomeIcon className="h-4 w-4" />,
        page: <PortalDashboard />,
      },
      {
        title: "Portal Bookings",
        to: "bookings",
        icon: <CalendarIcon className="h-4 w-4" />,
        page: <PortalBookings />,
      },
      {
        title: "Portal Leads",
        to: "leads",
        icon: <UsersIcon className="h-4 w-4" />,
        page: <PortalLeads />,
      },
      {
        title: "Lead Detail",
        to: "leads/:leadId",
        icon: <UserIcon className="h-4 w-4" />,
        page: <LeadDetail />,
      },
      {
        title: "Portal Locations",
        to: "locations",
        icon: <MapPinIcon className="h-4 w-4" />,
        page: <PortalLocations />,
      },
      {
        title: "Portal Classes",
        to: "classes",
        icon: <BookOpenIcon className="h-4 w-4" />,
        page: <PortalClasses />,
      },
      {
        title: "Add Classes",
        to: "classes/add",
        icon: <BookOpenIcon className="h-4 w-4" />,
        page: <AddClasses />,
      },
      {
        title: "Edit Class",
        to: "classes/edit/:classId",
        icon: <BookOpenIcon className="h-4 w-4" />,
        page: <EditClass />,
      },
      {
        title: "Portal Profile",
        to: "profile",
        icon: <UserIcon className="h-4 w-4" />,
        page: <PortalProfile />,
      },
      {
        title: "Portal Settings",
        to: "settings",
        icon: <SettingsIcon className="h-4 w-4" />,
        page: <PortalSettings />,
      },
      {
        title: "Portal Help",
        to: "help",
        icon: <HelpCircleIcon className="h-4 w-4" />,
        page: <PortalHelp />,
      },
      {
        title: "Portal Fallback",
        to: "*",
        icon: <HomeIcon className="h-4 w-4" />,
        page: <Navigate to="." replace />,
      },
    ],
  },
  // PUBLIC landing page routes - Add requireAuth={false}
  {
    title: "Spanish Landing",
    to: "/:franchiseeSlug/es",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><SpanishLanding /></SlugResolver>,
  },
  {
    title: "Find Classes",
    to: "/:franchiseeSlug/find-classes",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><FindClasses /></SlugResolver>,
  },
  {
    title: "Book Class",
    to: "/:franchiseeSlug/book",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><BookClass /></SlugResolver>,
  },
  {
    title: "Confirmation",
    to: "/:franchiseeSlug/confirmation",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><Confirmation /></SlugResolver>,
  },
  {
    title: "Contact Us",
    to: "/:franchiseeSlug/contact",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><ContactUs /></SlugResolver>,
  },
  {
    title: "Booking Landing",
    to: "/:franchiseeSlug/free-trial",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><BookingLanding /></SlugResolver>,
  },
  {
    title: "Booking Find Classes",
    to: "/:franchiseeSlug/free-trial/find-classes",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><BookingFindClasses /></SlugResolver>,
  },
  {
    title: "Class Booking",
    to: "/:franchiseeSlug/free-trial/classes",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><ClassBooking /></SlugResolver>,
  },
  {
    title: "Free Trial Confirmation",
    to: "/:franchiseeSlug/free-trial/confirmation",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><BookingConfirmation /></SlugResolver>,
  },
  {
    title: "Booking Confirmation",
    to: "/:franchiseeSlug/free-trial/booking/:bookingId",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><BookingConfirmation /></SlugResolver>,
  },
  {
    title: "Thank You",
    to: "/:franchiseeSlug/thank-you",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><ThankYou /></SlugResolver>,
  },
  {
    title: "Spanish Info",
    to: "/:franchiseeSlug/spanish-info",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><SpanishInfo /></SlugResolver>,
  },
  {
    title: "Not Found",
    to: "*",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <NotFound />,
  },
];
