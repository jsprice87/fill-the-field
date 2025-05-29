
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  const { franchiseeId } = useParams<{ franchiseeId: string }>();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const resolveSlug = async () => {
      try {
        if (!franchiseeId) {
          console.error('No franchiseeId in URL params');
          setIsLoading(false);
          return;
        }

        console.log('SlugResolver: Resolving franchiseeId:', franchiseeId);

        // Check if franchiseeId is a UUID (meaning it's not a slug)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(franchiseeId)) {
          // It's already a UUID, but let's check if there's a slug for it
          const { data: { session } } = await supabase.auth.getSession();
          
          // Only redirect if this is the currently logged in user
          if (session?.user && session.user.id === franchiseeId) {
            const { data } = await supabase
              .from('franchisees')
              .select('slug')
              .eq('user_id', franchiseeId)
              .single();
              
            if (data?.slug) {
              // Redirect to the slug-based URL
              const path = location.pathname.replace(franchiseeId, data.slug);
              console.log('SlugResolver: Redirecting to slug-based URL:', path);
              navigate(path, { replace: true });
              return;
            }
          }
          
          // If no slug found or not the current user, treat as a franchisee ID
          // But we need to get the actual franchisee table ID, not the user ID
          const { data: franchiseeData } = await supabase
            .from('franchisees')
            .select('id')
            .eq('user_id', franchiseeId)
            .single();
            
          if (franchiseeData) {
            console.log('SlugResolver: Resolved UUID to franchisee ID:', franchiseeData.id);
            setResolvedId(franchiseeData.id);
          } else {
            console.error('SlugResolver: No franchisee found for user ID:', franchiseeId);
            toast.error('Invalid account URL');
            navigate('/login');
          }
        } else {
          // It's a slug, resolve it to a franchisee ID
          console.log('SlugResolver: Resolving slug to franchisee ID');
          const id = await getFranchiseeIdFromSlug(franchiseeId);
          
          if (id) {
            console.log('SlugResolver: Resolved slug to franchisee ID:', id);
            setResolvedId(id);
          } else {
            // Invalid slug
            console.error('SlugResolver: Invalid slug:', franchiseeId);
            toast.error('Invalid account URL');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('SlugResolver: Error resolving slug:', error);
        toast.error('Error loading account information');
      } finally {
        setIsLoading(false);
      }
    };

    resolveSlug();
  }, [franchiseeId, navigate, location.pathname]);

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
