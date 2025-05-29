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
      // Create a new flow with the resolved franchisee ID
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
      {/* Hero Section with Embedded Form */}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy to-brand-blue">
        {/* Hero Background Image Placeholder */}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Value Propositions */}
            <div className="text-left lg:text-center">
              <h1 className="font-anton text-4xl md:text-6xl lg:text-7xl mb-6 tracking-wide">
                SOCCER STARS
              </h1>
              <h2 className="font-agrandir text-xl md:text-3xl mb-8">
                Free Trial Classes Available
              </h2>
              
              {/* Value Propositions */}
              <div className="space-y-4 mb-8">
                <p className="font-poppins text-base md:text-lg flex items-center">
                  <span className="text-green-400 text-xl mr-3">✓</span>
                  Professional coaching for ages 2-14
                </p>
                <p className="font-poppins text-base md:text-lg flex items-center">
                  <span className="text-green-400 text-xl mr-3">✓</span>
                  Fun, non-competitive environment
                </p>
                <p className="font-poppins text-base md:text-lg flex items-center">
                  <span className="text-green-400 text-xl mr-3">✓</span>
                  Build confidence & skills through play
                </p>
              </div>
            </div>

            {/* Right Side - Embedded Form */}
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-auto">
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

      {/* Additional Information Section */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-agrandir text-3xl text-brand-navy text-center mb-12">
            Why Choose Soccer Stars?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚽</span>
              </div>
              <h4 className="font-agrandir text-xl mb-2">Expert Coaching</h4>
              <p className="font-poppins text-brand-grey">Professionally trained coaches who understand child development</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="font-agrandir text-xl mb-2">Age-Appropriate</h4>
              <p className="font-poppins text-brand-grey">Programs designed specifically for different age groups and skill levels</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏆</span>
              </div>
              <h4 className="font-agrandir text-xl mb-2">Fun First</h4>
              <p className="font-poppins text-brand-grey">Focus on enjoyment and confidence building over competition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingLanding;
