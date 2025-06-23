
import React from 'react';
import { AppShell, NavLink, ScrollArea, Stack } from '@mantine/core';
import { IconHome, IconUsers, IconSettings, IconLogout } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: <IconHome size={18} /> },
  { label: 'Bookings', href: '/bookings', icon: <IconUsers size={18} /> },
  { label: 'Franchisees', href: '/franchisees', icon: <IconUsers size={18} /> },
  { label: 'Settings', href: '/settings', icon: <IconSettings size={18} /> },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

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

  return (
    <div style={{ width: 260, padding: 16, borderRight: '1px solid var(--mantine-color-gray-3)', height: '100vh' }}>
      <ScrollArea style={{ height: '100%' }}>
        <Stack gap="xs" style={{ height: '100%' }}>
          <div style={{ flex: 1 }}>
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
          </div>
          
          <div>
            <NavLink
              label="Logout"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
            />
          </div>
        </Stack>
      </ScrollArea>
    </div>
  );
}

// Export compatibility components for gradual migration
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SidebarInset = ({ children, className, ...props }: { children: React.ReactNode, className?: string }) => (
  <main className={className} {...props}>{children}</main>
);
export const SidebarTrigger = () => null; // Will be removed in next step
