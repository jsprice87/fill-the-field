
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFranchiseeIdFromSlug } from '@/utils/slugUtils';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notify';
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
  const navigate = useNavigate();

  useEffect(() => {
    const resolveSlug = async () => {
      try {
        if (!franchiseeSlug) {
          if (requireAuth) {
            notify('error', 'Invalid URL - missing franchisee identifier');
            navigate('/login');
          } else {
            setIsPublicError(true);
          }
          return;
        }

        // Check if franchiseeSlug is a UUID (meaning it's not a slug)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(franchiseeSlug)) {
          // For authenticated routes, check if there's a slug for this UUID and redirect if possible
          if (requireAuth) {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Only redirect if this is the currently logged in user
            if (session?.user && session.user.id === franchiseeSlug) {
              const { data, error } = await supabase
                .from('franchisees')
                .select('slug')
                .eq('user_id', franchiseeSlug)
                .single();
                
              if (!error && data?.slug) {
                const path = window.location.pathname.replace(franchiseeSlug, data.slug);
                navigate(path, { replace: true });
                return;
              }
            }
          }
          
          // Use the UUID as franchisee ID directly
          setResolvedId(franchiseeSlug);
        } else {
          // It's a slug, resolve it to a franchisee ID
          const id = await getFranchiseeIdFromSlug(franchiseeSlug);
          
          if (id) {
            setResolvedId(id);
          } else {
            if (requireAuth) {
              // For authenticated routes, check if user is authenticated and has a franchisee record
              const { data: { session } } = await supabase.auth.getSession();
              
              if (session?.user) {
                const { data: franchisee, error } = await supabase
                  .from('franchisees')
                  .select('id, slug')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (franchisee && !error) {
                  if (franchisee.slug && franchisee.slug !== franchiseeSlug) {
                    const path = window.location.pathname.replace(franchiseeSlug, franchisee.slug);
                    navigate(path, { replace: true });
                    return;
                  } else {
                    setResolvedId(franchisee.id);
                    return;
                  }
                }
              }
              
              notify('error', 'Invalid account URL - franchisee not found');
              navigate('/login');
            } else {
              setIsPublicError(true);
            }
          }
        }
      } catch (error) {
        console.error('SlugResolver: Error resolving slug:', error);
        if (requireAuth) {
          notify('error', 'Error loading account information');
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
      </div>
    );
  }

  if (isPublicError) {
    return (
      <ErrorBoundary onReset={() => window.location.reload()}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="font-agrandir text-2xl text-brand-navy mb-2">Page Not Found</h1>
            <p className="font-poppins text-brand-grey mb-4">The requested page could not be found.</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!resolvedId) {
    return (
      <ErrorBoundary onReset={() => window.location.reload()}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
            <p className="text-gray-600">The requested franchisee account could not be found.</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Use context provider to pass franchisee ID to children
  return (
    <ErrorBoundary onReset={() => window.location.reload()}>
      <FranchiseeProvider franchiseeId={resolvedId}>
        {children}
      </FranchiseeProvider>
    </ErrorBoundary>
  );
};

export default SlugResolver;
