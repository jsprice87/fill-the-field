import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Burger, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppSidebar } from '@/components/AppSidebar';

const AdminLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard');
    }
  }, [location.pathname, navigate]);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      withBorder={false}
      className="admin-layout"
      data-section="admin"
    >
      <AppShell.Header>
        <div className="flex items-center h-full px-4">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size={rem(20)}
          />
          <div className="font-semibold ml-2">Fill&nbsp;the&nbsp;Field - Admin</div>
        </div>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppSidebar />
      </AppShell.Navbar>
      
      <AppShell.Main>
        <div className="mx-auto max-w-app">
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default AdminLayout;