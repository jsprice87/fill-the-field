import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Toaster } from '@/components/ui/toaster';
import { useEnsureFranchiseeProfile } from '@/hooks/useEnsureFranchiseeProfile';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: isProfileLoading } = useEnsureFranchiseeProfile();
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

  if (isProfileLoading || isFranchiseeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div 
        className={`min-h-screen flex w-full ${sectionType === 'portal' ? 'portal-layout' : ''} ${sectionType === 'admin' ? 'admin-layout' : ''}`}
        data-section={sectionType}
      >
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
            </div>
          </div>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
