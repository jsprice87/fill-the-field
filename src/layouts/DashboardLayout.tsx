
import { ReactNode } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarProvider,
  SidebarContent
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  UserCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("You've been signed out successfully");
    } catch (error) {
      toast.error("Error signing out. Please try again.");
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <Sidebar className="hidden md:flex">
          <SidebarContent>
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 px-4 py-6">
                <span className="text-xl font-bold text-indigo-600">SuperLeadStar</span>
              </div>
              <nav className="flex-1 space-y-1 px-2 py-4">
                <Link to="/portal/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/portal/locations">
                  <Button variant="ghost" className="w-full justify-start">
                    <MapPin className="mr-2 h-5 w-5" />
                    Locations
                  </Button>
                </Link>
                <Link to="/portal/classes">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="mr-2 h-5 w-5" />
                    Classes
                  </Button>
                </Link>
                <Link to="/portal/leads">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-5 w-5" />
                    Leads
                  </Button>
                </Link>
                <Link to="/portal/bookings">
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Bookings
                  </Button>
                </Link>
              </nav>
              <div className="border-t px-2 py-4">
                <Link to="/portal/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </Link>
                
                <Link to="/portal/profile">
                  <Button variant="ghost" className="w-full justify-start">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign out
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="border-b bg-white shadow-sm">
            <div className="flex h-16 items-center gap-4 px-4 md:px-6">
              <Link to="/portal" className="md:hidden">
                <span className="text-xl font-bold text-indigo-600">SLS</span>
              </Link>
              <div className="ml-auto flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="md:hidden">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
