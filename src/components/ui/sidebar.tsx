
import React from 'react';
import { AppShell, NavLink, ScrollArea, Stack } from '@mantine/core';
import { IconHome, IconUsers, IconCalendar, IconMapPin, IconBook, IconUser, IconSettings, IconHelp, IconGlobe, IconLogout } from '@tabler/icons-react';
import { useLocation, Link } from 'react-router-dom';

const mainMenuItems = [
  { title: 'Dashboard', url: '.', icon: IconHome },
  { title: 'Leads', url: 'leads', icon: IconUsers },
  { title: 'Bookings', url: 'bookings', icon: IconCalendar },
  { title: 'Locations', url: 'locations', icon: IconMapPin },
  { title: 'Classes', url: 'classes', icon: IconBook },
];

const secondaryMenuItems = [
  { title: 'Profile', url: 'profile', icon: IconUser },
  { title: 'Settings', url: 'settings', icon: IconSettings },
  { title: 'Help', url: 'help', icon: IconHelp },
];

interface SidebarProps {
  onNavigate?: (url: string) => void;
  onLandingPageNavigation?: () => void;
  landingPageUrl?: string;
  isActiveRoute?: (url: string) => boolean;
  franchiseeName?: string;
}

export function Sidebar({ 
  onNavigate, 
  onLandingPageNavigation, 
  landingPageUrl, 
  isActiveRoute,
  franchiseeName 
}: SidebarProps) {
  const location = useLocation();

  const handleNavClick = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    }
  };

  const checkActiveRoute = (url: string) => {
    if (isActiveRoute) {
      return isActiveRoute(url);
    }
    if (url === '.') {
      return location.pathname.endsWith('/portal');
    }
    return location.pathname.includes(url);
  };

  return (
    <AppShell.Navbar w={260} p="md">
      <AppShell.Section mb="md">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">FTF</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Fill the Field</span>
            <span className="truncate text-xs text-muted-foreground">
              {franchiseeName || 'Portal'}
            </span>
          </div>
        </div>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        <Stack gap="xs">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-2">Portal</div>
          {mainMenuItems.map((item) => (
            <NavLink
              key={item.title}
              label={item.title}
              leftSection={<item.icon size={18} />}
              active={checkActiveRoute(item.url)}
              onClick={() => handleNavClick(item.url)}
              className="cursor-pointer"
            />
          ))}
          
          {landingPageUrl && (
            <NavLink
              label="Landing Page"
              leftSection={<IconGlobe size={18} />}
              onClick={onLandingPageNavigation}
              className="cursor-pointer"
            />
          )}

          <div className="text-xs font-medium text-muted-foreground px-2 mb-2 mt-4">Account</div>
          {secondaryMenuItems.map((item) => (
            <NavLink
              key={item.title}
              label={item.title}
              leftSection={<item.icon size={18} />}
              active={checkActiveRoute(item.url)}
              onClick={() => handleNavClick(item.url)}
              className="cursor-pointer"
            />
          ))}
        </Stack>
      </AppShell.Section>

      <AppShell.Section>
        <NavLink
          label="Logout"
          leftSection={<IconLogout size={18} />}
          onClick={() => {/* TODO: Implement logout */}}
          className="cursor-pointer"
        />
      </AppShell.Section>
    </AppShell.Navbar>
  );
}

// Keep the original exports for compatibility
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SidebarTrigger = ({ className }: { className?: string }) => <div className={className} />;
export const SidebarInset = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;
export const useSidebar = () => ({
  state: 'expanded',
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
});
