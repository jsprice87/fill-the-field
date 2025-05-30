
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuickCaptureForm } from '@/components/booking/QuickCaptureForm';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { toast } from 'sonner';

interface BookingLandingProps {
  franchiseeId?: string;
}

const BookingLanding: React.FC<BookingLandingProps> = ({ franchiseeId: propFranchiseeId }) => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const { createFlow } = useBookingFlow();
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);

  // Use the prop from SlugResolver if available, otherwise this component won't work properly
  const resolvedFranchiseeId = propFranchiseeId;

  const handleFormSuccess = async (leadId: string, leadData: any) => {
    if (!resolvedFranchiseeId || !franchiseeSlug) {
      console.error('Missing required data for flow creation:', { resolvedFranchiseeId, franchiseeSlug });
      toast.error('Unable to start booking process. Please try again.');
      return;
    }
    
    console.log('Form success - creating flow with lead data:', { leadId, leadData, franchiseeId: resolvedFranchiseeId });
    
    setIsCreatingFlow(true);
    try {
      // Create a new flow with the resolved franchisee ID (UUID)
      const flowId = await createFlow(resolvedFranchiseeId, {
        leadId,
        leadData: {
          firstName: leadData.first_name,
          lastName: leadData.last_name,
          email: leadData.email,
          phone: leadData.phone,
          zip: leadData.zip
        }
      });
      
      console.log('Flow created successfully:', flowId);
      
      // Navigate to find classes with the flow ID (using slug in URL)
      navigate(`/${franchiseeSlug}/free-trial/find-classes?flow=${flowId}`);
    } catch (error) {
      console.error('Error creating flow:', error);
      toast.error('Failed to start booking process. Please try again.');
    } finally {
      setIsCreatingFlow(false);
    }
  };

  if (!resolvedFranchiseeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Not Found</h1>
          <p className="text-gray-600">The requested account could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image and Embedded Form */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(2, 29, 73, 0.8), rgba(0, 59, 206, 0.8)), url('/lovable-uploads/091e49b6-e2e1-413d-a1ac-f2763a697649.png')`
          }}
        />
        
        <div className="relative z-10 text-center text-white px-4 max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Branding and Value Propositions */}
            <div className="text-left lg:text-center space-y-8">
              {/* Logo */}
              <div className="flex justify-center lg:justify-center mb-6">
                <img 
                  src="/lovable-uploads/73ddb431-9bcb-476d-b5a8-e7cde1c58b51.png" 
                  alt="Soccer Stars Logo" 
                  className="h-16 md:h-20 w-auto"
                />
              </div>
              
              <h1 className="font-anton text-4xl md:text-6xl lg:text-7xl mb-6 tracking-wide text-center">
                FREE TRIAL CLASSES
              </h1>
              <h2 className="font-agrandir text-xl md:text-3xl mb-8 text-center">
                Fun Soccer for Kids Ages 2-14
              </h2>
              
              {/* Value Propositions */}
              <div className="space-y-6 mb-8">
                <p className="font-poppins text-lg md:text-xl flex items-center justify-center lg:justify-center">
                  <span className="text-green-400 text-2xl mr-4">⚽</span>
                  Professional coaching in a fun environment
                </p>
                <p className="font-poppins text-lg md:text-xl flex items-center justify-center lg:justify-center">
                  <span className="text-green-400 text-2xl mr-4">🏆</span>
                  Build confidence & skills through play
                </p>
                <p className="font-poppins text-lg md:text-xl flex items-center justify-center lg:justify-center">
                  <span className="text-green-400 text-2xl mr-4">👫</span>
                  Non-competitive, inclusive for all abilities
                </p>
              </div>
            </div>

            {/* Right Side - Embedded Form */}
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto">
              {isCreatingFlow ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
                  <p className="font-poppins text-gray-600">Starting your booking...</p>
                </div>
              ) : (
                <QuickCaptureForm 
                  franchiseeId={resolvedFranchiseeId}
                  onSuccess={handleFormSuccess}
                  showTitle={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Real Images */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-agrandir text-4xl text-brand-navy text-center mb-16">
            Why Choose Soccer Stars?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/7f7bff51-2396-4a17-a174-6c3e25b595b8.png" 
                  alt="Toddler Soccer Fun" 
                  className="w-full h-64 object-cover"
                />
              </div>
              <h4 className="font-agrandir text-2xl mb-4 text-brand-navy">Ages 2-4: Little Kickers</h4>
              <p className="font-poppins text-brand-grey text-lg">Fun introduction to soccer with focus on motor skills and following simple instructions</p>
            </div>
            
            <div className="text-center">
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/dfb117aa-f806-4773-b546-8666f24665db.png" 
                  alt="Youth Soccer Development" 
                  className="w-full h-64 object-cover"
                />
              </div>
              <h4 className="font-agrandir text-2xl mb-4 text-brand-navy">Ages 5-8: Skill Builders</h4>
              <p className="font-poppins text-brand-grey text-lg">Development of fundamental soccer skills with age-appropriate games and activities</p>
            </div>
            
            <div className="text-center">
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/a0964960-70c4-4c41-a94e-98ca3a2312e6.png" 
                  alt="Advanced Soccer Training" 
                  className="w-full h-64 object-cover"
                />
              </div>
              <h4 className="font-agrandir text-2xl mb-4 text-brand-navy">Ages 9-14: Advanced Players</h4>
              <p className="font-poppins text-brand-grey text-lg">Enhanced technical skills with tactical understanding and team play concepts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section with Happy Kids */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="font-agrandir text-4xl text-brand-navy mb-12">
            See the Joy in Action
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-xl">
                <p className="font-poppins text-xl text-gray-700 mb-4 italic">
                  "My daughter absolutely loves Soccer Stars! She's gained so much confidence and made great friends. The coaches are amazing with kids."
                </p>
                <p className="font-poppins font-semibold text-brand-navy">- Sarah M., Parent</p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl">
                <p className="font-poppins text-xl text-gray-700 mb-4 italic">
                  "The non-competitive environment is perfect for our son. He's learning skills while having a blast!"
                </p>
                <p className="font-poppins font-semibold text-brand-navy">- Mike D., Parent</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="/lovable-uploads/f5c00969-26f0-44a8-8551-f73f45e5fec2.png" 
                alt="Happy Soccer Kid" 
                className="rounded-lg shadow-lg w-full h-48 object-cover"
              />
              <img 
                src="/lovable-uploads/80139c96-b766-49d4-83b6-10e210326cd7.png" 
                alt="Excited Soccer Player" 
                className="rounded-lg shadow-lg w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 px-4 bg-brand-red text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-agrandir text-3xl md:text-4xl mb-6">
            Ready to Get Started?
          </h3>
          <p className="font-poppins text-xl mb-8">
            Join thousands of families who have discovered the joy of Soccer Stars. Your free trial is just a click away!
          </p>
          <button 
            onClick={() => {
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-brand-red px-8 py-4 rounded-lg font-poppins text-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Book Your Free Trial Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingLanding;
