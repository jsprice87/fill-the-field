
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Burger, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppSidebar } from '@/components/AppSidebar';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: isFranchiseeLoading } = useFranchiseeData();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  useEffect(() => {
    if (location.pathname === '/portal' || location.pathname === '/portal/') {
      navigate('/portal/dashboard');
    }
  }, [location.pathname, navigate]);

  // Determine section type for font styling
  const isAdminSection = location.pathname.startsWith('/admin');
  const isPortalSection = location.pathname.startsWith('/portal');
  const sectionType = isAdminSection ? 'admin' : (isPortalSection ? 'portal' : '');

  if (isFranchiseeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
      className={`${sectionType === 'portal' ? 'portal-layout' : ''} ${sectionType === 'admin' ? 'admin-layout' : ''}`}
      data-section={sectionType}
    >
      <AppShell.Header>
        <div className="flex items-center h-full px-4">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size={rem(20)}
          />
          <div className="font-semibold ml-2">Fill&nbsp;the&nbsp;Field</div>
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

export default DashboardLayout;
