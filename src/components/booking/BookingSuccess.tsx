
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Share2, Calendar, MapPin, User } from 'lucide-react';
import { Button, Card, Group, Stack, Text, Title, Notification } from '@mantine/core';
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
      <Card 
        className="border-l-4 border-l-green-500"
        padding="lg"
        radius="md"
        withBorder
      >
        <Group align="flex-start" mb="lg">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <Title order={3} className="font-agrandir text-xl text-brand-navy">
              Booking Confirmed!
            </Title>
            <Text className="font-poppins text-gray-600 mt-1" size="sm">
              Reference: {bookingData.booking_reference}
            </Text>
          </div>
        </Group>

        <Stack spacing="lg">
          <Text className="font-poppins text-gray-700">
            Thank you {bookingData.parent_first_name}! Your free trial has been successfully booked. 
            We're excited to see {appointment?.participant_name} on the field!
          </Text>

          {/* Quick booking details */}
          <Card className="bg-gray-50" padding="md" radius="md">
            {appointment && (
              <Stack spacing="xs">
                <Group spacing="xs">
                  <User className="h-4 w-4 text-brand-blue" />
                  <Text className="font-poppins" size="sm">
                    <strong>{appointment.participant_name}</strong> - {appointment.class_name}
                  </Text>
                </Group>
                <Group spacing="xs">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  <Text className="font-poppins" size="sm">
                    {new Date(appointment.selected_date).toLocaleDateString()} at {appointment.class_time}
                  </Text>
                </Group>
                <Group spacing="xs">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                  <Text className="font-poppins" size="sm">
                    {location.name}, {location.city}, {location.state}
                  </Text>
                </Group>
              </Stack>
            )}
          </Card>

          <Stack spacing="sm">
            <Button
              onClick={handleViewConfirmation}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
              size="lg"
              fullWidth
            >
              View Full Confirmation
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="font-poppins"
              size="lg"
              fullWidth
              leftSection={<Share2 className="h-4 w-4" />}
            >
              Share the Good News
            </Button>
          </Stack>

          <Notification 
            className="bg-blue-50 border border-blue-200"
            color="blue"
            title=""
            withCloseButton={false}
            radius="md"
          >
            <Text className="font-poppins text-blue-800 text-center" size="sm">
              📧 A confirmation email has been sent to {bookingData.parent_email}
            </Text>
          </Notification>
        </Stack>
      </Card>
    </div>
  );
};

export default BookingSuccess;
