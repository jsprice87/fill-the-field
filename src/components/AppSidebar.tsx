
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { CopyButton } from '@/components/ui/CopyButton';

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

  if (!isPortalSection) {
    return null;
  }

  return (
    <div className="relative">
      <Sidebar
        onNavigate={handleNavigation}
        onLandingPageNavigation={handleLandingPageNavigation}
        landingPageUrl={landingPageUrl}
        isActiveRoute={isActiveRoute}
        franchiseeName={franchiseeData?.business_name}
      />
      
      {/* Theme toggle positioned at bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-2"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </Button>
      </div>
    </div>
  );
}
