
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MetaPixelProvider, useMetaPixelTracking } from '@/components/booking/MetaPixelProvider';

interface ThankYouContentProps {
  franchiseeId: string;
}

const ThankYouContent: React.FC<ThankYouContentProps> = ({ franchiseeId }) => {
  const { trackEvent } = useMetaPixelTracking();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Track Meta Pixel CompleteRegistration event when page loads
    trackEvent('CompleteRegistration');
  }, [trackEvent]);

  const bookingReference = searchParams.get('ref');
  const childName = searchParams.get('child');
  const className = searchParams.get('class');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const location = searchParams.get('location');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your free trial class has been successfully booked.
            </p>
          </div>

          {bookingReference && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-xl font-mono font-semibold text-gray-900">
                {bookingReference}
              </p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {childName && (
              <div className="flex items-center justify-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>Child:</strong> {childName}
                </span>
              </div>
            )}
            
            {className && (
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>Class:</strong> {className}
                </span>
              </div>
            )}
            
            {date && time && (
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>Date & Time:</strong> {date} at {time}
                </span>
              </div>
            )}
            
            {location && (
              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>Location:</strong> {location}
                </span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Arrive 15 minutes early for check-in</li>
              <li>• Bring water and wear comfortable clothes</li>
              <li>• No special equipment needed - we provide everything!</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => window.print()}
            >
              Print Confirmation
            </Button>
            <Button
              onClick={() => {
                const subject = encodeURIComponent('Soccer Stars Free Trial Booking Confirmed');
                const body = encodeURIComponent(`Great news! I just booked a free soccer trial for ${childName || 'my child'} at Soccer Stars!\n\nBooking Reference: ${bookingReference}\nClass: ${className}\nDate: ${date} at ${time}\nLocation: ${location}\n\nI'm excited to see them learn and have fun!`);
                window.open(`mailto:?subject=${subject}&body=${body}`);
              }}
            >
              Share the Good News
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ThankYouProps {
  franchiseeId?: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ franchiseeId }) => {
  const { franchiseeSlug } = useParams();
  
  // If franchiseeId is not provided as prop, we could derive it from the slug
  // For now, we'll assume it's passed as prop or handle the case gracefully
  if (!franchiseeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Thank you for your booking.</p>
        </div>
      </div>
    );
  }

  return (
    <MetaPixelProvider franchiseeId={franchiseeId}>
      <ThankYouContent franchiseeId={franchiseeId} />
    </MetaPixelProvider>
  );
};

export default ThankYou;
