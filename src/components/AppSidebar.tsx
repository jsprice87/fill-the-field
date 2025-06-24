
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import { ScrollArea, Stack, Group, Text, NavLink } from '@mantine/core';
import { IconHome, IconUsers, IconCalendar, IconMapPin, IconBook, IconUser, IconSettings, IconHelp, IconWorld, IconMoon, IconSun, IconLogout, IconChartBar, IconCreditCard, IconShield } from '@tabler/icons-react';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useUserRole } from '@/hooks/useUserRole';
import { CopyButton } from '@/components/ui/CopyButton';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mainMenuItems = [
  { title: 'Dashboard', url: '.', icon: IconHome },
  { title: 'Leads', url: 'leads', icon: IconUsers },
  { title: 'Bookings', url: 'bookings', icon: IconCalendar },
  { title: 'Locations', url: 'locations', icon: IconMapPin },
  { title: 'Classes', url: 'classes', icon: IconBook },
];

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: IconHome },
  { title: 'User Management', url: '/admin/user-management', icon: IconUsers },
  { title: 'Transactions', url: '/admin/transactions', icon: IconCreditCard },
  { title: 'Global Settings', url: '/admin/settings/global', icon: IconSettings },
  { title: 'Settings', url: '/admin/settings', icon: IconShield },
];

const secondaryMenuItems = [
  { title: 'Profile', url: 'profile', icon: IconUser },
  { title: 'Settings', url: 'settings', icon: IconSettings },
  { title: 'Help', url: 'help', icon: IconHelp },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const { data: franchiseeData } = useFranchiseeData();
  const { role } = useUserRole();

  const isPortalSection = location.pathname.startsWith('/portal') || location.pathname.includes('/portal');
  const isAdminSection = location.pathname.startsWith('/admin');
  
  // Construct the public landing page URL - now points to /free-trial/
  const landingPageUrl = franchiseeSlug ? `${window.location.origin}/${franchiseeSlug}/free-trial/` : '';

  const handleNavigation = (url: string) => {
    if (isAdminSection) {
      // For admin section, use absolute navigation
      navigate(url);
    } else if (url === '.') {
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
    if (isAdminSection) {
      return location.pathname === url;
    }
    if (url === '.') {
      // Dashboard is active when we're at the exact portal path
      return location.pathname.endsWith('/portal');
    }
    return location.pathname.includes(url);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error logging out");
        console.error("Logout error:", error);
      } else {
        toast.success("Logged out successfully");
        navigate('/login', { replace: true });
      }
    } catch (error) {
      toast.error("Error logging out");
      console.error("Logout error:", error);
    }
  };

  // Show different sidebar content based on section
  if (isAdminSection) {
    return (
      <div style={{ width: 260, padding: 16, borderRight: '1px solid var(--mantine-color-gray-3)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Group mb="md">
          <div style={{ 
            width: 32, 
            height: 32, 
            backgroundColor: 'var(--mantine-primary-color-filled)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: 600
          }}>
            FTF
          </div>
          <div>
            <Text size="sm" fw={600}>Fill the Field</Text>
            <Text size="xs" c="dimmed">Admin Portal</Text>
          </div>
        </Group>

        {/* Admin Navigation */}
        <ScrollArea style={{ flex: 1 }}>
          <Text size="xs" tt="uppercase" fw={500} c="dimmed" mb="xs">Admin</Text>
          <Stack gap={2}>
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.title}
                label={item.title}
                leftSection={<item.icon size={18} />}
                active={isActiveRoute(item.url)}
                onClick={() => handleNavigation(item.url)}
              />
            ))}
          </Stack>
        </ScrollArea>

        {/* Footer */}
        <div>
          <NavLink
            label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}
            leftSection={colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            onClick={() => toggleColorScheme()}
          />
          <NavLink
            label="Logout"
            leftSection={<IconLogout size={18} />}
            onClick={handleLogout}
          />
        </div>
      </div>
    );
  }

  if (!isPortalSection) {
    return null;
  }

  return (
    <div style={{ width: 260, padding: 16, borderRight: '1px solid var(--mantine-color-gray-3)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Group mb="md">
        <div style={{ 
          width: 32, 
          height: 32, 
          backgroundColor: 'var(--mantine-primary-color-filled)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 14,
          fontWeight: 600
        }}>
          FTF
        </div>
        <div>
          <Text size="sm" fw={600}>Fill the Field</Text>
          <Text size="xs" c="dimmed">
            {franchiseeData?.business_name || 'Portal'}
          </Text>
        </div>
      </Group>

      {/* Main Navigation */}
      <ScrollArea style={{ flex: 1 }}>
        <Text size="xs" tt="uppercase" fw={500} c="dimmed" mb="xs">Portal</Text>
        <Stack gap={2}>
          {mainMenuItems.map((item) => (
            <NavLink
              key={item.title}
              label={item.title}
              leftSection={<item.icon size={18} />}
              active={isActiveRoute(item.url)}
              onClick={() => handleNavigation(item.url)}
            />
          ))}
          
          {/* Landing Page item with copy button */}
          <NavLink
            label="Landing Page"
            leftSection={<IconWorld size={18} />}
            onClick={handleLandingPageNavigation}
            rightSection={
              landingPageUrl ? (
                <CopyButton 
                  url={landingPageUrl}
                  className="opacity-50 hover:opacity-100"
                />
              ) : undefined
            }
          />
        </Stack>

        <Text size="xs" tt="uppercase" fw={500} c="dimmed" mb="xs" mt="md">Account</Text>
        <Stack gap={2}>
          {secondaryMenuItems.map((item) => (
            <NavLink
              key={item.title}
              label={item.title}
              leftSection={<item.icon size={18} />}
              active={isActiveRoute(item.url)}
              onClick={() => handleNavigation(item.url)}
            />
          ))}
        </Stack>
      </ScrollArea>

      {/* Footer */}
      <div>
        <NavLink
          label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}
          leftSection={colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          onClick={() => toggleColorScheme()}
        />
        <NavLink
          label="Logout"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}
