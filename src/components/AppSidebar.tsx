
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { HomeIcon, UsersIcon, CalendarIcon, MapPinIcon, BookOpenIcon, UserIcon, SettingsIcon, HelpCircleIcon, Globe } from 'lucide-react';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { CopyButton } from '@/components/ui/CopyButton';

const mainMenuItems = [
  { title: 'Dashboard', url: '.', icon: HomeIcon },
  { title: 'Leads', url: 'leads', icon: UsersIcon },
  { title: 'Bookings', url: 'bookings', icon: CalendarIcon },
  { title: 'Locations', url: 'locations', icon: MapPinIcon },
  { title: 'Classes', url: 'classes', icon: BookOpenIcon },
];

const secondaryMenuItems = [
  { title: 'Profile', url: 'profile', icon: UserIcon },
  { title: 'Settings', url: 'settings', icon: SettingsIcon },
  { title: 'Help', url: 'help', icon: HelpCircleIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const { data: franchiseeData } = useFranchiseeData();

  const isPortalSection = location.pathname.startsWith('/portal') || location.pathname.includes('/portal');
  
  // Construct the public landing page URL - now points to /free-trial/
  const landingPageUrl = franchiseeSlug ? `${window.location.origin}/${franchiseeSlug}/free-trial/` : '';

  const handleNavigation = (url: string) => {
    if (url === '.') {
      // For dashboard, navigate to the current portal base path
      const basePath = location.pathname.split('/portal')[0] + '/portal';
      navigate(basePath);
    } else {
      // For other items, use relative navigation
      navigate(url);
    }
  };

  const handleLandingPageNavigation = () => {
    if (landingPageUrl) {
      window.open(landingPageUrl, '_blank');
    }
  };

  const isActiveRoute = (url: string) => {
    if (url === '.') {
      // Dashboard is active when we're at the exact portal path
      return location.pathname.endsWith('/portal');
    }
    return location.pathname.includes(url);
  };

  if (!isPortalSection) {
    return null;
  }

  return (
    <Sidebar className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 z-50 flex flex-col">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={isActiveRoute(item.url)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Landing Page item with copy button */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLandingPageNavigation}
                  className="flex items-center justify-between pr-2"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Landing Page</span>
                  </div>
                  {landingPageUrl && (
                    <CopyButton 
                      url={landingPageUrl}
                      className="ml-auto"
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer to push secondary items to bottom */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item.url)}
                      isActive={isActiveRoute(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
