
import React from 'react';
import { useParams } from 'react-router-dom';

const BookingConfirmation: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - CONFIRMATION</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-agrandir text-3xl text-brand-navy mb-8">Confirm Your Booking</h2>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="font-poppins text-gray-600">Booking confirmation interface will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
