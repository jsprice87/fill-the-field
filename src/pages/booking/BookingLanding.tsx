
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuickCaptureForm } from '@/components/booking/QuickCaptureForm';

const BookingLanding: React.FC = () => {
  const { franchiseeId } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    navigate(`/${franchiseeId}/free-trial/find-classes`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy to-brand-blue">
        {/* Hero Background Image Placeholder */}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="font-anton text-5xl md:text-7xl lg:text-8xl mb-6 tracking-wide">
            SOCCER STARS
          </h1>
          <h2 className="font-agrandir text-2xl md:text-4xl mb-8">
            Free Trial Classes Available
          </h2>
          
          {/* Value Propositions */}
          <div className="mb-12 space-y-4">
            <p className="font-poppins text-lg md:text-xl">✓ Professional coaching for ages 2-14</p>
            <p className="font-poppins text-lg md:text-xl">✓ Fun, non-competitive environment</p>
            <p className="font-poppins text-lg md:text-xl">✓ Build confidence & skills through play</p>
          </div>
          
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins font-semibold text-xl px-12 py-6 rounded-lg transform hover:scale-105 transition-all duration-200"
            >
              Find a Free Trial
            </Button>
          )}
        </div>
      </div>

      {/* Quick Capture Form Modal/Panel */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <QuickCaptureForm 
              franchiseeId={franchiseeId!}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Additional Sections for Mobile Scroll */}
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
