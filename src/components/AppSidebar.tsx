
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { HomeIcon, UsersIcon, CalendarIcon, MapPinIcon, BookOpenIcon, UserIcon, SettingsIcon, HelpCircleIcon } from 'lucide-react';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const portalMenuItems = [
  { title: 'Dashboard', url: '.', icon: HomeIcon },
  { title: 'Leads', url: 'leads', icon: UsersIcon },
  { title: 'Bookings', url: 'bookings', icon: CalendarIcon },
  { title: 'Locations', url: 'locations', icon: MapPinIcon },
  { title: 'Classes', url: 'classes', icon: BookOpenIcon },
  { title: 'Profile', url: 'profile', icon: UserIcon },
  { title: 'Settings', url: 'settings', icon: SettingsIcon },
  { title: 'Help', url: 'help', icon: HelpCircleIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: franchiseeData } = useFranchiseeData();

  const isPortalSection = location.pathname.startsWith('/portal') || location.pathname.includes('/portal');
  
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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portalMenuItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
