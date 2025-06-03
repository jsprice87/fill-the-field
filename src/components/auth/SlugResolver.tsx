
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFranchiseeIdFromSlug } from '@/utils/slugUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { FranchiseeProvider } from '@/contexts/FranchiseeContext';

interface SlugResolverProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Component that resolves a slug in the URL to a franchisee ID
 * and provides it via context to child components
 */
const SlugResolver = ({ children, requireAuth = true }: SlugResolverProps) => {
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublicError, setIsPublicError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const navigate = useNavigate();

  // Add debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[SlugResolver DEBUG] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const resolveSlug = async () => {
      try {
        addDebugLog(`Starting resolution for slug: ${franchiseeSlug}, requireAuth: ${requireAuth}`);
        addDebugLog(`Environment: ${window.location.hostname}, userAgent: ${navigator.userAgent.substring(0, 50)}...`);
        
        // Test Supabase connection
        try {
          const { data, error } = await supabase.from('franchisees').select('count').limit(1);
          if (error) {
            addDebugLog(`Supabase connection test failed: ${error.message}`);
          } else {
            addDebugLog('Supabase connection test successful');
          }
        } catch (dbError) {
          addDebugLog(`Supabase connection test error: ${dbError}`);
        }
        
        if (!franchiseeSlug) {
          addDebugLog('No franchiseeSlug in URL parameters');
          if (requireAuth) {
            toast.error('Invalid URL - missing franchisee identifier');
            navigate('/login');
          } else {
            setIsPublicError(true);
          }
          return;
        }

        // Check if franchiseeSlug is a UUID (meaning it's not a slug)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(franchiseeSlug)) {
          addDebugLog('Detected UUID in URL, checking for corresponding slug...');
          
          // It's already a UUID, but let's check if there's a slug for it
          if (requireAuth) {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Only redirect if this is the currently logged in user
            if (session?.user && session.user.id === franchiseeSlug) {
              const { data, error } = await supabase
                .from('franchisees')
                .select('slug')
                .eq('user_id', franchiseeSlug)
                .single();
                
              if (error) {
                addDebugLog(`Error fetching franchisee data: ${error.message}`);
              }
              
              if (data?.slug) {
                addDebugLog('Found slug for UUID, redirecting to slug-based URL');
                // Redirect to the slug-based URL
                const path = window.location.pathname.replace(franchiseeSlug, data.slug);
                navigate(path, { replace: true });
                return;
              }
            }
          }
          
          // If no slug found or not the current user, just use the ID
          addDebugLog('Using UUID as franchisee ID');
          setResolvedId(franchiseeSlug);
        } else {
          addDebugLog(`Resolving slug to franchisee ID: ${franchiseeSlug}`);
          // It's a slug, resolve it to a franchisee ID
          const id = await getFranchiseeIdFromSlug(franchiseeSlug);
          
          if (id) {
            addDebugLog(`Successfully resolved slug to ID: ${id}`);
            setResolvedId(id);
          } else {
            // Invalid slug - handle differently for public vs authenticated routes
            addDebugLog(`Failed to resolve slug: ${franchiseeSlug}`);
            
            if (requireAuth) {
              // For authenticated routes, check if user is authenticated and has a franchisee record
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                addDebugLog('User is authenticated, checking for franchisee record...');
                
                const { data: franchisee, error } = await supabase
                  .from('franchisees')
                  .select('id, slug')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (franchisee && !error) {
                  addDebugLog(`Found franchisee record: ${JSON.stringify(franchisee)}`);
                  
                  if (franchisee.slug && franchisee.slug !== franchiseeSlug) {
                    addDebugLog(`Redirecting to correct slug: ${franchisee.slug}`);
                    const path = window.location.pathname.replace(franchiseeSlug, franchisee.slug);
                    navigate(path, { replace: true });
                    return;
                  } else {
                    addDebugLog('Using franchisee ID directly');
                    setResolvedId(franchisee.id);
                    return;
                  }
                }
              }
              
              toast.error('Invalid account URL - franchisee not found');
              navigate('/login');
            } else {
              // For public routes, just show an error state instead of redirecting
              addDebugLog('Public route with invalid slug - showing error state');
              setIsPublicError(true);
            }
          }
        }
      } catch (error) {
        addDebugLog(`Error resolving slug: ${error}`);
        console.error('SlugResolver: Error resolving slug:', error);
        if (requireAuth) {
          toast.error('Error loading account information');
          navigate('/login');
        } else {
          setIsPublicError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    resolveSlug();
  }, [franchiseeSlug, navigate, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        {/* Show debug info in development or when debugging is needed */}
        {(window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) && (
          <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded max-w-md max-h-64 overflow-y-auto text-xs">
            <h4 className="font-bold mb-2">Debug Info:</h4>
            {debugInfo.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isPublicError) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="font-agrandir text-2xl text-brand-navy mb-2">No Findy Page</h1>
            <p className="font-poppins text-brand-grey mb-4">The requested page could not be found.</p>
            {/* Show debug info when needed */}
            {(window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) && (
              <details className="mt-4 text-left bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer font-semibold">Debug Information</summary>
                <div className="mt-2 text-xs space-y-1">
                  <div><strong>URL:</strong> {window.location.href}</div>
                  <div><strong>Slug:</strong> {franchiseeSlug}</div>
                  <div><strong>Require Auth:</strong> {requireAuth.toString()}</div>
                  <div><strong>Debug Logs:</strong></div>
                  {debugInfo.map((log, index) => (
                    <div key={index} className="ml-2">{log}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!resolvedId) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
            <p className="text-gray-600">The requested franchisee account could not be found.</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Use context provider instead of prop injection
  return (
    <ErrorBoundary>
      <FranchiseeProvider franchiseeId={resolvedId}>
        {children}
      </FranchiseeProvider>
    </ErrorBoundary>
  );
};

export default SlugResolver;
