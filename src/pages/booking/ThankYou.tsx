
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, User } from 'lucide-react';
import { Button, Card, Stack, Group, Text, Title } from '@mantine/core';
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
      <Card className="max-w-2xl w-full" padding="xl" radius="md" withBorder>
        <Stack align="center" spacing="lg">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <Title order={1} className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </Title>
            <Text className="text-lg text-gray-600">
              Your free trial class has been successfully booked.
            </Text>
          </div>

          {bookingReference && (
            <Card className="bg-gray-100 w-full" padding="md" radius="md">
              <Stack align="center" spacing="xs">
                <Text className="text-sm text-gray-600">Booking Reference</Text>
                <Text className="text-xl font-mono font-semibold text-gray-900">
                  {bookingReference}
                </Text>
              </Stack>
            </Card>
          )}

          <Stack spacing="md" align="center">
            {childName && (
              <Group spacing="sm">
                <User className="w-5 h-5 text-blue-600" />
                <Text className="text-gray-700">
                  <strong>Child:</strong> {childName}
                </Text>
              </Group>
            )}
            
            {className && (
              <Group spacing="sm">
                <Calendar className="w-5 h-5 text-blue-600" />
                <Text className="text-gray-700">
                  <strong>Class:</strong> {className}
                </Text>
              </Group>
            )}
            
            {date && time && (
              <Group spacing="sm">
                <Clock className="w-5 h-5 text-blue-600" />
                <Text className="text-gray-700">
                  <strong>Date & Time:</strong> {date} at {time}
                </Text>
              </Group>
            )}
            
            {location && (
              <Group spacing="sm">
                <MapPin className="w-5 h-5 text-blue-600" />
                <Text className="text-gray-700">
                  <strong>Location:</strong> {location}
                </Text>
              </Group>
            )}
          </Stack>

          <Card className="bg-blue-50 w-full" padding="lg" radius="md">
            <Stack spacing="sm">
              <Title order={3} className="font-semibold text-blue-900">What's Next?</Title>
              <Stack spacing="xs" align="flex-start">
                <Text className="text-sm text-blue-800">• You'll receive a confirmation email shortly</Text>
                <Text className="text-sm text-blue-800">• Arrive 15 minutes early for check-in</Text>
                <Text className="text-sm text-blue-800">• Bring water and wear comfortable clothes</Text>
                <Text className="text-sm text-blue-800">• No special equipment needed - we provide everything!</Text>
              </Stack>
            </Stack>
          </Card>

          <Group spacing="sm">
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
          </Group>
        </Stack>
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
