
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { HomeIcon, UsersIcon, CalendarIcon, MapPinIcon, BookOpenIcon, UserIcon, SettingsIcon, HelpCircleIcon, Globe, Moon, Sun } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!isPortalSection) {
    return null;
  }

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      className="border-r"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex flex-col gap-2 px-2 py-2">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">FTF</span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Fill the Field</span>
              <span className="truncate text-xs text-muted-foreground">
                {franchiseeData?.business_name || 'Portal'}
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

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
                    tooltip={item.title}
                    className="ui-hover ui-pressed ui-focus"
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
                  tooltip="Landing Page"
                  className="flex items-center justify-between pr-2 ui-hover ui-pressed ui-focus"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Landing Page</span>
                  </div>
                  {landingPageUrl && (
                    <CopyButton 
                      url={landingPageUrl}
                      className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={isActiveRoute(item.url)}
                    tooltip={item.title}
                    className="ui-hover ui-pressed ui-focus"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start gap-2 ui-hover ui-pressed ui-focus"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="group-data-[collapsible=icon]:hidden">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
