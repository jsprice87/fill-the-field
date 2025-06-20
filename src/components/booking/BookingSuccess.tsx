
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Share2, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { notify } from '@/utils/notify';

interface BookingSuccessProps {
  bookingData: {
    booking_reference: string;
    parent_first_name: string;
    parent_email: string;
    appointments: Array<{
      participant_name: string;
      class_name: string;
      selected_date: string;
      class_time: string;
    }>;
    class_schedules: {
      classes: {
        locations: {
          name: string;
          address: string;
          city: string;
          state: string;
        };
      };
    };
  };
  franchiseeSlug: string;
  onMetaPixelTracking?: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({
  bookingData,
  franchiseeSlug,
  onMetaPixelTracking
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Track Meta Pixel CompleteRegistration event when booking is successful
    if (onMetaPixelTracking) {
      onMetaPixelTracking();
    }
  }, [onMetaPixelTracking]);

  const handleViewConfirmation = () => {
    // Navigate to confirmation page with booking_reference as URL parameter
    const confirmationUrl = `/${franchiseeSlug}/booking/confirmation?booking_reference=${encodeURIComponent(bookingData.booking_reference)}`;
    navigate(confirmationUrl);
  };

  const handleShare = async () => {
    const confirmationUrl = `${window.location.origin}/${franchiseeSlug}/booking/confirmation?booking_reference=${encodeURIComponent(bookingData.booking_reference)}`;
    const message = `Great news! I just booked a free soccer trial for ${bookingData.appointments[0]?.participant_name} at Soccer Stars!\n\nView the booking: ${confirmationUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Soccer Trial Booking Confirmed',
          text: message,
          url: confirmationUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(message);
      notify('success', 'Booking link copied to clipboard!');
    }
  };

  const appointment = bookingData.appointments[0];
  const location = bookingData.class_schedules.classes.locations;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-l-4 border-l-green-500">
        <Card.Section className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <div className="font-agrandir text-xl text-brand-navy">
                Booking Confirmed!
              </div>
              <p className="font-poppins text-gray-600 mt-1">
                Reference: {bookingData.booking_reference}
              </p>
            </div>
          </div>
        </Card.Section>
        <Card.Section className="p-6">
          <p className="font-poppins text-gray-700 mb-6">
            Thank you {bookingData.parent_first_name}! Your free trial has been successfully booked. 
            We're excited to see {appointment?.participant_name} on the field!
          </p>

          {/* Quick booking details */}
          <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
            {appointment && (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-blue" />
                  <span className="font-poppins text-sm">
                    <strong>{appointment.participant_name}</strong> - {appointment.class_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  <span className="font-poppins text-sm">
                    {new Date(appointment.selected_date).toLocaleDateString()} at {appointment.class_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                  <span className="font-poppins text-sm">
                    {location.name}, {location.city}, {location.state}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleViewConfirmation}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
              size="lg"
            >
              View Full Confirmation
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full font-poppins"
              size="lg"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share the Good News
            </Button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-poppins text-blue-800 text-center text-sm">
              📧 A confirmation email has been sent to {bookingData.parent_email}
            </p>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};

export default BookingSuccess;
