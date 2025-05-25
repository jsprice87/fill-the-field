
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuickCaptureForm } from '@/components/booking/QuickCaptureForm';
import { useBookingSession } from '@/hooks/useBookingSession';

const BookingLanding: React.FC = () => {
  const { franchiseeId } = useParams();
  const navigate = useNavigate();
  const { updateSession, clearSession } = useBookingSession();

  // Clear any existing session data when the page loads
  useEffect(() => {
    console.log('BookingLanding: Clearing existing session data for new visitor');
    clearSession();
  }, [clearSession]);

  const handleFormSuccess = (leadId: string, leadData: any) => {
    console.log('Form success - storing lead data:', { leadId, leadData });
    
    // Store both the lead ID and the complete lead data in the session
    updateSession({ 
      leadId,
      leadData: {
        firstName: leadData.first_name,
        lastName: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        zip: leadData.zip
      }
    });
    
    navigate(`/${franchiseeId}/free-trial/find-classes`);
  };

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
              <QuickCaptureForm 
                franchiseeId={franchiseeId!}
                onSuccess={handleFormSuccess}
                showTitle={true}
              />
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
