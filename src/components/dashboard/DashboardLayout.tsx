
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
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
    <SidebarProvider defaultOpen={true}>
      <div 
        className={`min-h-screen flex w-full bg-background ${sectionType === 'portal' ? 'portal-layout' : ''} ${sectionType === 'admin' ? 'admin-layout' : ''}`}
        data-section={sectionType}
      >
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mx-auto max-w-app">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
