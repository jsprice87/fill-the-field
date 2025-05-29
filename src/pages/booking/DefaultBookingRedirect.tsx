
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DefaultBookingRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToDefaultFranchisee = async () => {
      try {
        console.log('Looking for default franchisee to redirect to...');
        
        // Get the first active franchisee with a slug
        const { data: franchisee, error } = await supabase
          .from('franchisees')
          .select('slug')
          .not('slug', 'is', null)
          .eq('subscription_status', 'active')
          .limit(1)
          .single();

        if (error || !franchisee) {
          console.error('No active franchisee found:', error);
          toast.error('No booking pages are currently available');
          navigate('/');
          return;
        }

        console.log('Redirecting to franchisee:', franchisee.slug);
        // Redirect to the franchisee's booking landing page
        navigate(`/${franchisee.slug}/free-trial`, { replace: true });
        
      } catch (error) {
        console.error('Error finding default franchisee:', error);
        toast.error('Unable to load booking page');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    redirectToDefaultFranchisee();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy to-brand-blue">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-poppins text-lg">Loading booking page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default DefaultBookingRedirect;
