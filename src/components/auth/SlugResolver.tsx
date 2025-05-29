
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFranchiseeIdFromSlug } from '@/utils/slugUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SlugResolverProps {
  children: React.ReactNode;
}

/**
 * Component that resolves a slug in the URL to a franchisee ID
 * and injects it into the context for child components
 */
const SlugResolver = ({ children }: SlugResolverProps) => {
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const resolveSlug = async () => {
      try {
        if (!franchiseeSlug) return;

        // Check if franchiseeSlug is a UUID (meaning it's not a slug)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(franchiseeSlug)) {
          // It's already a UUID, but let's check if there's a slug for it
          const { data: { session } } = await supabase.auth.getSession();
          
          // Only redirect if this is the currently logged in user
          if (session?.user && session.user.id === franchiseeSlug) {
            const { data } = await supabase
              .from('franchisees')
              .select('slug')
              .eq('user_id', franchiseeSlug)
              .single();
              
            if (data?.slug) {
              // Redirect to the slug-based URL
              const path = window.location.pathname.replace(franchiseeSlug, data.slug);
              navigate(path, { replace: true });
              return;
            }
          }
          
          // If no slug found or not the current user, just use the ID
          setResolvedId(franchiseeSlug);
        } else {
          // It's a slug, resolve it to a franchisee ID
          const id = await getFranchiseeIdFromSlug(franchiseeSlug);
          
          if (id) {
            setResolvedId(id);
          } else {
            // Invalid slug
            toast.error('Invalid account URL');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error resolving slug:', error);
        toast.error('Error loading account information');
      } finally {
        setIsLoading(false);
      }
    };

    resolveSlug();
  }, [franchiseeSlug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
