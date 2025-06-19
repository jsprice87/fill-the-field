
import React from 'react';
import { Navbar, NavLink, ScrollArea, Stack } from '@mantine/core';
import { IconHome, IconUsers, IconSettings, IconLogout } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: <IconHome size={18} /> },
  { label: 'Leads', href: '/portal/leads', icon: <IconUsers size={18} /> },
  { label: 'Bookings', href: '/portal/bookings', icon: <IconUsers size={18} /> },
  { label: 'Locations', href: '/portal/locations', icon: <IconSettings size={18} /> },
  { label: 'Classes', href: '/portal/classes', icon: <IconSettings size={18} /> },
];

const secondaryLinks = [
  { label: 'Profile', href: '/portal/profile', icon: <IconUsers size={18} /> },
  { label: 'Settings', href: '/portal/settings', icon: <IconSettings size={18} /> },
  { label: 'Help', href: '/portal/help', icon: <IconUsers size={18} /> },
];

export default function AppSidebar() {
  const { pathname } = useLocation();

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  };

  return (
    <Navbar width={{ base: 260 }} p="md" withBorder>
      <Navbar.Section grow component={ScrollArea}>
        <Stack gap="xs">
          {links.map((l) => (
            <NavLink
              key={l.href}
              label={l.label}
              component={Link}
              to={l.href}
              leftSection={l.icon}
              active={pathname.startsWith(l.href)}
            />
          ))}
        </Stack>
        
        <Stack gap="xs" mt="md">
          {secondaryLinks.map((l) => (
            <NavLink
              key={l.href}
              label={l.label}
              component={Link}
              to={l.href}
              leftSection={l.icon}
              active={pathname.startsWith(l.href)}
            />
          ))}
        </Stack>
      </Navbar.Section>

      <Navbar.Section>
        <NavLink
          label="Logout"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
        />
      </Navbar.Section>
    </Navbar>
  );
}

// Export compatibility components for gradual migration
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SidebarInset = ({ children, className, ...props }: { children: React.ReactNode, className?: string }) => (
  <main className={className} {...props}>{children}</main>
);
export const SidebarTrigger = () => null; // Will be removed in next step
