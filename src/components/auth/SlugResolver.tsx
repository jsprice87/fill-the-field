
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFranchiseeIdFromSlug } from '@/utils/slugUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SlugResolverProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Component that resolves a slug in the URL to a franchisee ID
 * and injects it into the context for child components
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
        console.log('SlugResolver: Starting resolution for slug:', franchiseeSlug, 'requireAuth:', requireAuth);
        
        if (!franchiseeSlug) {
          console.error('SlugResolver: No franchiseeSlug in URL parameters');
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
          console.log('SlugResolver: Detected UUID in URL, checking for corresponding slug...');
          
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
                console.error('SlugResolver: Error fetching franchisee data:', error);
              }
              
              if (data?.slug) {
                console.log('SlugResolver: Found slug for UUID, redirecting to slug-based URL');
                // Redirect to the slug-based URL
                const path = window.location.pathname.replace(franchiseeSlug, data.slug);
                navigate(path, { replace: true });
                return;
              }
            }
          }
          
          // If no slug found or not the current user, just use the ID
          console.log('SlugResolver: Using UUID as franchisee ID');
          setResolvedId(franchiseeSlug);
        } else {
          console.log('SlugResolver: Resolving slug to franchisee ID:', franchiseeSlug);
          // It's a slug, resolve it to a franchisee ID
          const id = await getFranchiseeIdFromSlug(franchiseeSlug);
          
          if (id) {
            console.log('SlugResolver: Successfully resolved slug to ID:', id);
            setResolvedId(id);
          } else {
            // Invalid slug - handle differently for public vs authenticated routes
            console.error('SlugResolver: Failed to resolve slug:', franchiseeSlug);
            
            if (requireAuth) {
              // For authenticated routes, check if user is authenticated and has a franchisee record
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                console.log('SlugResolver: User is authenticated, checking for franchisee record...');
                
                const { data: franchisee, error } = await supabase
                  .from('franchisees')
                  .select('id, slug')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (franchisee && !error) {
                  console.log('SlugResolver: Found franchisee record:', franchisee);
                  
                  if (franchisee.slug && franchisee.slug !== franchiseeSlug) {
                    console.log('SlugResolver: Redirecting to correct slug:', franchisee.slug);
                    const path = window.location.pathname.replace(franchiseeSlug, franchisee.slug);
                    navigate(path, { replace: true });
                    return;
                  } else {
                    console.log('SlugResolver: Using franchisee ID directly');
                    setResolvedId(franchisee.id);
                    return;
                  }
                }
              }
              
              toast.error('Invalid account URL - franchisee not found');
              navigate('/login');
            } else {
              // For public routes, just show an error state instead of redirecting
              console.log('SlugResolver: Public route with invalid slug - showing error state');
              setIsPublicError(true);
            }
          }
        }
      } catch (error) {
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
      </div>
    );
  }

  if (isPublicError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-agrandir text-2xl text-brand-navy mb-2">Page Not Found</h1>
          <p className="font-poppins text-brand-grey">The requested page could not be found.</p>
        </div>
      </div>
    );
  }

  if (!resolvedId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
          <p className="text-gray-600">The requested franchisee account could not be found.</p>
        </div>
      </div>
    );
  }

  // Inject resolvedId as a prop to all children
  return (
    <React.Fragment>
      {React.Children.map(children, (child) => {
        // Only add props to valid React elements
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            franchiseeId: resolvedId,
          });
        }
        return child;
      })}
    </React.Fragment>
  );
};

export default SlugResolver;
