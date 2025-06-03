
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
        addDebugLog(`=== STARTING SLUG RESOLUTION ===`);
        addDebugLog(`Slug: ${franchiseeSlug}`);
        addDebugLog(`RequireAuth: ${requireAuth}`);
        addDebugLog(`URL: ${window.location.href}`);
        
        // Test authentication status
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        addDebugLog(`Auth session exists: ${!!session}`);
        if (sessionError) {
          addDebugLog(`Session error: ${sessionError.message}`);
        }
        
        // Test basic Supabase connectivity
        try {
          addDebugLog('Testing Supabase connection...');
          const { data: testData, error: testError } = await supabase
            .from('franchisees')
            .select('count')
            .limit(1);
          
          if (testError) {
            addDebugLog(`Supabase test FAILED: ${testError.message}`);
            addDebugLog(`Error code: ${testError.code}`);
            addDebugLog(`Error details: ${JSON.stringify(testError.details)}`);
          } else {
            addDebugLog(`Supabase test PASSED: ${JSON.stringify(testData)}`);
          }
        } catch (connError) {
          addDebugLog(`Supabase connection exception: ${connError}`);
        }
        
        if (!franchiseeSlug) {
          addDebugLog('❌ FAILURE: No franchiseeSlug in URL parameters');
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
          addDebugLog('✓ Detected UUID in URL, using as franchisee ID');
          
          // For authenticated routes, check if there's a slug for this UUID and redirect if possible
          if (requireAuth) {
            addDebugLog('Checking for slug redirect for authenticated route...');
            
            // Only redirect if this is the currently logged in user
            if (session?.user && session.user.id === franchiseeSlug) {
              const { data, error } = await supabase
                .from('franchisees')
                .select('slug')
                .eq('user_id', franchiseeSlug)
                .single();
                
              if (!error && data?.slug) {
                addDebugLog('Found slug for UUID, redirecting to slug-based URL');
                const path = window.location.pathname.replace(franchiseeSlug, data.slug);
                navigate(path, { replace: true });
                return;
              }
            }
          }
          
          // Use the UUID as franchisee ID directly
          addDebugLog('✓ Using UUID as franchisee ID');
          setResolvedId(franchiseeSlug);
        } else {
          addDebugLog(`🔍 RESOLVING SLUG: ${franchiseeSlug}`);
          
          // It's a slug, resolve it to a franchisee ID
          const id = await getFranchiseeIdFromSlug(franchiseeSlug);
          
          addDebugLog(`Slug resolution result: ${id}`);
          
          if (id) {
            addDebugLog(`✅ SUCCESS: Resolved slug to ID: ${id}`);
            setResolvedId(id);
          } else {
            addDebugLog(`❌ FAILED: Could not resolve slug: ${franchiseeSlug}`);
            
            if (requireAuth) {
              addDebugLog('Handling auth route failure...');
              // For authenticated routes, check if user is authenticated and has a franchisee record
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
              addDebugLog('🚨 PUBLIC ROUTE ERROR: Showing error state for public route');
              setIsPublicError(true);
            }
          }
        }
      } catch (error) {
        addDebugLog(`💥 EXCEPTION: ${error}`);
        addDebugLog(`Exception stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
        console.error('SlugResolver: Error resolving slug:', error);
        if (requireAuth) {
          toast.error('Error loading account information');
          navigate('/login');
        } else {
          setIsPublicError(true);
        }
      } finally {
        addDebugLog(`=== RESOLUTION COMPLETE ===`);
        setIsLoading(false);
      }
    };

    resolveSlug();
  }, [franchiseeSlug, navigate, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        {/* Always show debug info when loading */}
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded max-w-md max-h-64 overflow-y-auto text-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          {debugInfo.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    );
  }

  if (isPublicError) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="font-agrandir text-2xl text-brand-navy mb-2">Page Not Found</h1>
            <p className="font-poppins text-brand-grey mb-4">The requested page could not be found.</p>
            {/* Always show debug info for public errors */}
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
            {/* Show debug info */}
            <details className="mt-4 text-left bg-gray-100 p-4 rounded">
              <summary className="cursor-pointer font-semibold">Debug Information</summary>
              <div className="mt-2 text-xs space-y-1">
                {debugInfo.map((log, index) => (
                  <div key={index} className="ml-2">{log}</div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Use context provider to pass franchisee ID to children
  return (
    <ErrorBoundary>
      <FranchiseeProvider franchiseeId={resolvedId}>
        {children}
      </FranchiseeProvider>
    </ErrorBoundary>
  );
};

export default SlugResolver;
