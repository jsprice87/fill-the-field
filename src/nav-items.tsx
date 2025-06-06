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
import ClassesList from "./pages/portal/ClassesList";
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
import LandingPage from "./pages/landing/LandingPage";
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
    title: "Classes List Redirect",
    to: "/portal/classes/list",
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
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin User Management",
    to: "/admin/user-management",
    icon: <UsersIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout>
          <AdminUserManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin Transactions",
    to: "/admin/transactions",
    icon: <CreditCardIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout>
          <AdminTransactions />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin Global Settings",
    to: "/admin/settings/global",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout>
          <AdminGlobalSettings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    title: "Admin Settings",
    to: "/admin/settings",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: (
      <ProtectedRoute>
        <DashboardLayout>
          <AdminSettings />
        </DashboardLayout>
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
  // Franchisee slug-based portal routes - KEEP requireAuth default (true)
  {
    title: "Franchisee Portal Dashboard",
    to: "/:franchiseeSlug/portal/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalDashboard /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Leads",
    to: "/:franchiseeSlug/portal/leads",
    icon: <UsersIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalLeads /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Lead Detail",
    to: "/:franchiseeSlug/portal/leads/:leadId",
    icon: <UserIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><LeadDetail /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Bookings",
    to: "/:franchiseeSlug/portal/bookings",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalBookings /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Locations",
    to: "/:franchiseeSlug/portal/locations",
    icon: <MapPinIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalLocations /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Classes",
    to: "/:franchiseeSlug/portal/classes",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><ClassesList /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Classes List",
    to: "/:franchiseeSlug/portal/classes/list",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><ClassesList /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Add Classes",
    to: "/:franchiseeSlug/portal/classes/add",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><AddClasses /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Edit Class",
    to: "/:franchiseeSlug/portal/classes/edit/:classId",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><EditClass /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Profile",
    to: "/:franchiseeSlug/portal/profile",
    icon: <UserIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalProfile /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Settings",
    to: "/:franchiseeSlug/portal/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalSettings /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  {
    title: "Franchisee Portal Help",
    to: "/:franchiseeSlug/portal/help",
    icon: <HelpCircleIcon className="h-4 w-4" />,
    page: <SlugResolver><ProtectedRoute><DashboardLayout><PortalHelp /></DashboardLayout></ProtectedRoute></SlugResolver>,
  },
  // PUBLIC landing page routes - Add requireAuth={false}
  {
    title: "Landing Page",
    to: "/:franchiseeSlug",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <SlugResolver requireAuth={false}><LandingPage /></SlugResolver>,
  },
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
