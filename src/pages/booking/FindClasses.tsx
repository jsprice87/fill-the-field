
import React from 'react';
import { useParams } from 'react-router-dom';

const FindClasses: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - FIND CLASSES</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-agrandir text-3xl text-brand-navy mb-8">Find Classes Near You</h2>
        
        {/* Map Section - Placeholder */}
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center mb-8">
          <p className="font-poppins text-gray-600">Interactive Map Coming Soon</p>
        </div>
        
        {/* Location List - Placeholder */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-agrandir text-xl mb-4">Locations in Your Area</h3>
          <p className="font-poppins text-gray-600">Location selector will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

export default FindClasses;
