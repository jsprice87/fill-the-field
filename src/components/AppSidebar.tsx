
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Navbar, NavLink, ScrollArea, Stack, Group, Text, ActionIcon } from '@mantine/core';
import { IconHome, IconUsers, IconCalendar, IconMapPin, IconBook, IconUser, IconSettings, IconHelp, IconWorld, IconMoon, IconSun, IconLogout } from '@tabler/icons-react';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { CopyButton } from '@/components/ui/CopyButton';

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

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  };

  if (!isPortalSection) {
    return null;
  }

  return (
    <Navbar width={{ base: 260 }} p="md" withBorder>
      {/* Header */}
      <Navbar.Section>
        <Group>
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
      </Navbar.Section>

      {/* Main Navigation */}
      <Navbar.Section grow component={ScrollArea} mt="md">
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
      </Navbar.Section>

      {/* Footer */}
      <Navbar.Section>
        <NavLink
          label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          leftSection={theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          onClick={toggleTheme}
        />
        <NavLink
          label="Logout"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
        />
      </Navbar.Section>
    </Navbar>
  );
}
