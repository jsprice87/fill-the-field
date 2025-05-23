
import React from 'react';
import { useParams } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const { franchiseeId, bookingId } = useParams();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - THANK YOU</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <span className="text-green-600 text-4xl">✓</span>
          </div>
          
          <h2 className="font-agrandir text-4xl text-brand-navy mb-4">Booking Confirmed!</h2>
          <p className="font-poppins text-lg text-gray-600 mb-8">
            Your free trial class has been booked. We're excited to see you on the field!
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="font-poppins text-gray-600">
              Booking ID: {bookingId}
            </p>
            <p className="font-poppins text-gray-600">
              Confirmation details will be implemented here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
