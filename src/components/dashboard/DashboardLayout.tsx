
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { AppSidebar } from '@/components/AppSidebar';
import { Toaster } from '@/components/ui/toaster';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: isFranchiseeLoading } = useFranchiseeData();

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
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding="md"
      className={`${sectionType === 'portal' ? 'portal-layout' : ''} ${sectionType === 'admin' ? 'admin-layout' : ''}`}
      data-section={sectionType}
    >
      <AppShell.Navbar>
        <AppSidebar />
      </AppShell.Navbar>
      
      <AppShell.Main>
        <div className="mx-auto max-w-app">
          <Outlet />
        </div>
      </AppShell.Main>
      
      <Toaster />
    </AppShell>
  );
};

export default DashboardLayout;
