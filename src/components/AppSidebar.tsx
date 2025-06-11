
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
  { title: 'Dashboard', url: '/portal/dashboard', icon: HomeIcon },
  { title: 'Leads', url: '/portal/leads', icon: UsersIcon },
  { title: 'Bookings', url: '/portal/bookings', icon: CalendarIcon },
  { title: 'Locations', url: '/portal/locations', icon: MapPinIcon },
  { title: 'Classes', url: '/portal/classes', icon: BookOpenIcon },
  { title: 'Profile', url: '/portal/profile', icon: UserIcon },
  { title: 'Settings', url: '/portal/settings', icon: SettingsIcon },
  { title: 'Help', url: '/portal/help', icon: HelpCircleIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: franchiseeData } = useFranchiseeData();

  const isPortalSection = location.pathname.startsWith('/portal') || location.pathname.includes('/portal');
  
  const handleNavigation = (url: string) => {
    if (isPortalSection && franchiseeData?.slug) {
      navigate(`/${franchiseeData.slug}${url}`);
    } else {
      navigate(url);
    }
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
                    isActive={location.pathname.includes(item.url)}
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
