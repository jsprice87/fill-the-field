import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuickCaptureForm } from '@/components/booking/QuickCaptureForm';
import { MetaPixelProvider, useMetaPixelTracking } from '@/components/booking/MetaPixelProvider';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useFranchiseeOptional } from '@/contexts/FranchiseeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Clock, Users, Star, Phone, Mail } from 'lucide-react';
import { Button } from '@mantine/core';

const BookingLandingContent: React.FC = () => {
  const {
    franchiseeSlug
  } = useParams();
  const navigate = useNavigate();
  const {
    createFlow
  } = useBookingFlow();
  const {
    trackEvent
  } = useMetaPixelTracking();
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);

  // Get franchisee data from context
  const franchiseeContext = useFranchiseeOptional();
  const franchiseeId = franchiseeContext?.franchiseeId;
  
  // State for public franchisee data (loaded by slug)
  const [franchiseeData, setFranchiseeData] = useState<{
    email: string;
    phone?: string;
    company_name: string;
  } | null>(null);

  useEffect(() => {
    if (franchiseeSlug) {
      loadFranchiseeData();
    }
  }, [franchiseeSlug]);

  const loadFranchiseeData = async () => {
    try {
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('email, phone, company_name')
        .eq('slug', franchiseeSlug)
        .single();

      if (franchiseeError || !franchisee) {
        console.error('Franchisee error:', franchiseeError);
        return;
      }

      setFranchiseeData(franchisee);
    } catch (error) {
      console.error('Error loading franchisee data:', error);
    }
  };
  const handleLeadCreated = () => {
    // Track Meta Pixel Lead event
    trackEvent('Lead');
  };
  const handleFormSuccess = async (leadId: string, leadData: any) => {
    if (!franchiseeId || !franchiseeSlug) {
      console.error('Missing required data for flow creation:', {
        franchiseeId,
        franchiseeSlug
      });
      toast.error('Unable to start booking process. Please try again.');
      return;
    }
    setIsCreatingFlow(true);
    try {
      const flowId = await createFlow(franchiseeId, {
        leadId,
        leadData: {
          firstName: leadData.first_name,
          lastName: leadData.last_name,
          email: leadData.email,
          phone: leadData.phone,
          zip: leadData.zip
        }
      });
      navigate(`/${franchiseeSlug}/free-trial/find-classes?flow=${flowId}`);
    } catch (error) {
      console.error('Error creating flow:', error);
      toast.error('Failed to start booking process. Please try again.');
    } finally {
      setIsCreatingFlow(false);
    }
  };
  if (!franchiseeId) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-agrandir text-2xl text-brand-navy mb-2">Account Not Found</h1>
          <p className="font-poppins text-brand-grey">The requested account could not be found.</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-white">
      {/* Hero Section - 70-100vh with background image and overlay */}
      <section className="hero-section relative flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `linear-gradient(rgba(2, 29, 73, 0.8), rgba(0, 59, 206, 0.8)), url('/lovable-uploads/091e49b6-e2e1-413d-a1ac-f2763a697649.png')`
      }} />
        
        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Brand and Value Props */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="flex justify-center lg:justify-start mb-8">
                <img src="https://pub-6d374fd755954f29bcb59d4f2c5c7fe7.r2.dev/media/SS%20Logos_2021-03.svg" alt="Soccer Stars Logo" className="h-16 md:h-20 w-auto" loading="eager" />
              </div>
              
              <h1 className="font-anton text-4xl lg:text-7xl text-white mb-6 font-medium md:text-6xl">
                FREE TRIAL CLASSES
              </h1>
              
              <h2 className="font-agrandir text-xl md:text-2xl text-white mb-8">
                Fun Soccer for Kids Ages 12 months to 12 years!
              </h2>
              
              {/* Three Key Value Props */}
              <div className="space-y-4 mb-8 text-white">
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <p className="font-poppins text-lg text-slate-400">Professional coaching in a fun environment</p>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                  <p className="font-poppins text-lg text-slate-400">Build confidence & skills through play</p>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <p className="font-poppins text-lg text-slate-400">Non-competitive, inclusive for all abilities</p>
                </div>
              </div>
            </div>

            {/* Right Side - Lead Capture Form */}
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-auto order-1 lg:order-2">
              {isCreatingFlow ? <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
                  <p className="font-poppins text-brand-grey">Starting your booking...</p>
                </div> : <QuickCaptureForm franchiseeId={franchiseeId} onSuccess={handleFormSuccess} onLeadCreated={handleLeadCreated} showTitle={true} />}
            </div>
          </div>
        </div>
      </section>

      {/* Value-Prop Strip - Two alternating sections */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h3 className="font-agrandir text-4xl text-brand-navy text-center mb-16">
            Why Choose Soccer Stars?
          </h3>
          
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Super Soccer Stars - Image left, text right on desktop */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/lovable-uploads/dfb117aa-f806-4773-b546-8666f24665db.png" 
                    alt="Youth Soccer Development" 
                    className="w-full h-auto object-contain max-w-md mx-auto"
                    loading="lazy" 
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-agrandir text-2xl mb-4 text-brand-navy">Ages 2-10+: Super Soccer Stars</h4>
                <p className="font-poppins text-brand-grey text-lg text-slate-500">Super Soccer Stars teaches the fundamentals in a fun, educational, and non-competitive environment. Our philosophy focuses on positive reinforcement, personalized attention, and a low child-to-coach ratio in every class. This approach ensures each child builds confidence and develops skills at their own pace.</p>
              </div>
            </div>

            {/* Parent & Me - Image right, text left on desktop (row-reverse) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/lovable-uploads/7f7bff51-2396-4a17-a174-6c3e25b595b8.png" 
                    alt="Toddler Soccer Fun" 
                    className="w-full h-auto object-contain max-w-md mx-auto"
                    loading="lazy" 
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-agrandir text-2xl mb-4 text-brand-navy">12-24 months: Parent & Me</h4>
                <p className="font-poppins text-brand-grey text-lg text-slate-500">Dive into a world of stimulating play and physical engagement alongside your little one in our program.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="font-agrandir text-4xl text-brand-navy text-center mb-12">What is everyone saying about Soccer Stars?</h3>
          
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-xl border-l-4 border-l-brand-red">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="font-poppins text-xl text-gray-700 mb-4 italic">
                  "My daughter absolutely loves Soccer Stars! She's gained so much confidence and made great friends. The coaches are amazing with kids."
                </p>
                <p className="font-poppins font-semibold text-brand-navy">- Sarah M., Littleton Parent</p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl border-l-4 border-l-brand-blue">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="font-poppins text-xl text-gray-700 mb-4 italic">&quot;This was the first team sport we have done with our 3 year old and have been impressed. The coaches have all been amazing with the toddlers and we cannot wait to start the next season!&quot;</p>
                <p className="font-poppins font-semibold text-brand-navy">- Stacey W., Denver Parent</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img src="/lovable-uploads/f5c00969-26f0-44a8-8551-f73f45e5fec2.png" alt="Happy Soccer Kid" className="rounded-lg shadow-lg w-full h-72 object-cover" loading="lazy" />
              <img src="/lovable-uploads/80139c96-b766-49d4-83b6-10e210326cd7.png" alt="Excited Soccer Player" className="rounded-lg shadow-lg w-full h-72 object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band - Navy background with white text and red button */}
      <section className="cta-band">
        <div className="container mx-auto px-4">
          <h3 className="font-agrandir text-3xl md:text-4xl mb-6 text-white">
            Ready to Get Started?
          </h3>
          <p className="font-poppins text-xl mb-8 text-white max-w-2xl mx-auto">
            Join thousands of families who have discovered the joy of Soccer Stars. Your free trial is just a click away!
          </p>
          <Button 
            className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins"
            size="lg"
            onClick={() => {
              document.querySelector('form')?.scrollIntoView({
                behavior: 'smooth'
              });
            }} 
            styles={{
              root: {
                fontSize: '18px'
              }
            }}
          >
            Find Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer - Navy background, three columns */}
      <footer className="soccer-footer">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Column 1: Sitemap Links */}
            <div>
              <h4 className="font-agrandir text-lg mb-4 text-white">Programs</h4>
              <div className="space-y-2">
                <p className="font-poppins text-gray-300">Parent & Me (Ages 12-24 months)</p>
                <p className="font-poppins text-gray-300">Super Soccer Stars (Ages 2-10+ years)</p>
                <p className="font-poppins text-gray-300">Free Trial Classes</p>
              </div>
            </div>
            
            {/* Column 2: Contact Info */}
            <div>
              <h4 className="font-agrandir text-lg mb-4 text-white">Contact Us</h4>
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-poppins">
                    {franchiseeData?.phone || 'Contact for details'}
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="font-poppins">
                    {franchiseeData?.email || 'contact@fillthefield.com'}
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-poppins">Find Local Programs</span>
                </div>
              </div>
            </div>
            
            {/* Column 3: Social Icons */}
            
          </div>
          
          <div className="border-t border-gray-600 pt-6 text-center">
            <p className="font-poppins text-gray-400 text-sm">
              © {new Date().getFullYear()} Soccer Stars. All rights reserved. | Backed by 25 years of experience
            </p>
          </div>
        </div>
      </footer>
    </div>;
};

const BookingLanding: React.FC = () => {
  const franchiseeContext = useFranchiseeOptional();
  const franchiseeId = franchiseeContext?.franchiseeId;
  if (!franchiseeId) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-agrandir text-2xl text-brand-navy mb-2">Account Not Found</h1>
          <p className="font-poppins text-brand-grey">The requested account could not be found.</p>
        </div>
      </div>;
  }
  return <MetaPixelProvider franchiseeId={franchiseeId}>
      <BookingLandingContent />
    </MetaPixelProvider>;
};

export default BookingLanding;
