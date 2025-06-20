import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingReference = searchParams.get('booking_reference');

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/booking/confirmation?booking_reference=${encodeURIComponent(bookingReference || '')}`;
    const shareMessage = `Check out my booking confirmation: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Booking Confirmation',
          text: shareMessage,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareMessage);
      alert('Confirmation link copied to clipboard!');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500 mr-4" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Thank You!</h2>
            <p className="text-gray-600">Your booking is confirmed.</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          A confirmation email has been sent to your registered email address.
        </p>

        {bookingReference && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Reference:</h3>
            <p className="text-gray-700">{bookingReference}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ThankYou;
