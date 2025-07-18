
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Stack, Group, Text, Title, Loader, Anchor } from '@mantine/core';
import { CheckCircle, Calendar, MapPin, Clock, User, Share2, Phone, Globe, Facebook, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BookingData {
  id: string;
  booking_reference: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  class_schedule_id: string;
  appointments: Array<{
    selected_date: string;
    class_name: string;
    class_time: string;
    participant_name: string;
  }>;
  class_schedules: {
    classes: {
      name: string;
      locations: {
        name: string;
        address: string;
        city: string;
        state: string;
        phone?: string;
      };
    };
  };
}

interface FranchiseeData {
  company_name: string;
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface FranchiseeSettings {
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  share_message_template?: string;
}

const BookingConfirmation: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [franchiseeData, setFranchiseeData] = useState<FranchiseeData | null>(null);
  const [franchiseeSettings, setFranchiseeSettings] = useState<FranchiseeSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!franchiseeSlug) {
      navigate('/');
      return;
    }
    loadBookingData();
  }, [franchiseeSlug]);

  const loadBookingData = async () => {
    try {
      // Accept both 'ref' and 'booking_reference' query params for backward compatibility
      const bookingReference = searchParams.get('booking_reference') || searchParams.get('ref');
      console.log('Looking for booking with reference:', bookingReference);
      
      if (!bookingReference) {
        throw new Error('Booking reference not found');
      }

      console.log('Loading booking with reference:', bookingReference);

      // Get franchisee by slug first
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('*')
        .eq('slug', franchiseeSlug)
        .maybeSingle();

      if (franchiseeError) {
        console.error('Error fetching franchisee:', franchiseeError);
        throw new Error('Franchisee not found');
      }

      if (!franchisee) {
        throw new Error('Franchisee not found');
      }

      setFranchiseeData(franchisee);

      // Get franchisee settings with the new RLS policy
      const { data: settings, error: settingsError } = await supabase
        .from('franchisee_settings')
        .select('*')
        .eq('franchisee_id', franchisee.id);

      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
        // Don't throw here, settings are optional
      } else if (settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, string>);
        setFranchiseeSettings(settingsMap);
      }

      // Get booking details using the updated RLS policy
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          appointments (*),
          class_schedules (
            classes (
              name,
              locations (
                name,
                address,
                city,
                state,
                phone
              )
            )
          )
        `)
        .eq('booking_reference', bookingReference)
        .maybeSingle();

      if (bookingError) {
        console.error('Error fetching booking:', bookingError);
        throw new Error('Failed to load booking details');
      }

      if (!bookingData) {
        throw new Error('Booking not found');
      }

      console.log('Booking loaded successfully:', bookingData);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking details');
      navigate(`/${franchiseeSlug}/free-trial`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${franchiseeSlug}/free-trial`;
    const message = franchiseeSettings.share_message_template 
      ? franchiseeSettings.share_message_template
          .replace('{company_name}', franchiseeData?.company_name || 'Soccer Stars')
          .replace('{url}', shareUrl)
      : `I just signed up my child for a free soccer trial at ${franchiseeData?.company_name || 'Soccer Stars'}! Check it out: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          text: message
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(message);
      toast.success('Share message copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center">
          <Loader style={{ color: '#031E4D' }} size="lg" className="mx-auto mb-4" />
          <Text style={{ fontFamily: 'Poppins, sans-serif' }} className="text-gray-600">Loading booking details...</Text>
        </div>
      </div>
    );
  }

  if (!booking || !franchiseeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center">
          <Title order={1} style={{ fontFamily: 'Poppins, sans-serif', color: '#031E4D' }} className="text-2xl font-bold mb-4">Booking Not Found</Title>
          <Text style={{ fontFamily: 'Poppins, sans-serif' }} className="text-gray-600 mb-6">We couldn't find the booking you're looking for.</Text>
          <Button 
            onClick={() => navigate(`/${franchiseeSlug}/free-trial`)}
            style={{ backgroundColor: '#CE0E2D', fontFamily: 'Poppins, sans-serif' }}
            className="text-white hover:opacity-90 font-medium rounded-lg transition-all"
          >
            Back to Booking
          </Button>
        </div>
      </div>
    );
  }

  const appointment = booking.appointments[0];
  const location = booking.class_schedules.classes.locations;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div style={{ backgroundColor: '#031E4D' }} className="text-white py-8">
        <div className="container mx-auto px-4">
          <img 
            src="https://pub-6d374fd755954f29bcb59d4f2c5c7fe7.r2.dev/media/SS%20Logos_2021-03.svg" 
            alt="Soccer Stars" 
            className="h-16 w-auto mb-2"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <Title order={2} className="text-xl font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Booking Confirmed!</Title>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Stack spacing="lg">
          {/* Success Message */}
          <Card className="border-l-4" style={{ borderLeftColor: '#CE0E2D' }} padding="lg" radius="md" withBorder>
            <Group spacing="sm" mb="md">
              <CheckCircle className="h-8 w-8" style={{ color: '#CE0E2D' }} />
              <div>
                <Title order={3} style={{ fontFamily: 'Poppins, sans-serif', color: '#031E4D' }} className="text-xl font-bold">
                  Booking Confirmed!
                </Title>
                <Text className="font-poppins text-gray-600 mt-1">
                  Reference: {booking.booking_reference}
                </Text>
              </div>
            </Group>
            
            <Text className="font-poppins text-gray-700">
              Thank you {booking.parent_first_name}! Your free trial has been successfully booked. 
              We're excited to see {appointment.participant_name} on the field!
            </Text>
          </Card>

          {/* Booking Details */}
          <Card padding="lg" radius="md" withBorder>
            <Title order={4} style={{ fontFamily: 'Poppins, sans-serif', color: '#031E4D' }} className="text-lg font-bold" mb="md">Booking Details</Title>
            <Stack spacing="md">
              <Group align="flex-start" spacing="sm">
                <Calendar className="h-5 w-5 mt-1" style={{ color: '#031E4D' }} />
                <div>
                  <Text className="font-poppins font-medium">Date & Time</Text>
                  <Text className="font-poppins text-gray-600">
                    {format(new Date(appointment.selected_date), 'EEEE, MMMM d, yyyy')} at {appointment.class_time}
                  </Text>
                </div>
              </Group>

              <Group align="flex-start" spacing="sm">
                <User className="h-5 w-5 mt-1" style={{ color: '#031E4D' }} />
                <div>
                  <Text className="font-poppins font-medium">Class</Text>
                  <Text className="font-poppins text-gray-600">{appointment.class_name}</Text>
                </div>
              </Group>

              <Group align="flex-start" spacing="sm">
                <MapPin className="h-5 w-5 mt-1" style={{ color: '#031E4D' }} />
                <div>
                  <Text className="font-poppins font-medium">Location</Text>
                  <Text className="font-poppins text-gray-600">
                    {location.name}<br />
                    {location.address}, {location.city}, {location.state}
                  </Text>
                  {location.phone && (
                    <Group spacing="xs" mt="xs">
                      <Phone className="h-4 w-4" />
                      <Text className="font-poppins text-gray-600">
                        {location.phone}
                      </Text>
                    </Group>
                  )}
                </div>
              </Group>
            </Stack>
          </Card>

          {/* Contact Information */}
          {(franchiseeData.phone || franchiseeData.address || franchiseeSettings.website_url) && (
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} style={{ fontFamily: 'Poppins, sans-serif', color: '#031E4D' }} className="text-lg font-bold" mb="md">Contact Information</Title>
              <Stack spacing="sm">
                {franchiseeData.phone && (
                  <Group spacing="sm">
                    <Phone className="h-5 w-5" style={{ color: '#031E4D' }} />
                    <Text className="font-poppins text-gray-700">{franchiseeData.phone}</Text>
                  </Group>
                )}
                
                {franchiseeData.address && (
                  <Group align="flex-start" spacing="sm">
                    <MapPin className="h-5 w-5 mt-1" style={{ color: '#031E4D' }} />
                    <Text className="font-poppins text-gray-700">
                      {franchiseeData.address}
                      {franchiseeData.city && franchiseeData.state && (
                        <><br />{franchiseeData.city}, {franchiseeData.state}</>
                      )}
                    </Text>
                  </Group>
                )}

                {franchiseeSettings.website_url && (
                  <Group spacing="sm">
                    <Globe className="h-5 w-5" style={{ color: '#031E4D' }} />
                    <Anchor 
                      href={franchiseeSettings.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-poppins text-brand-blue hover:underline"
                    >
                      Visit our website
                    </Anchor>
                  </Group>
                )}
              </Stack>
            </Card>
          )}

          {/* Actions */}
          <Stack spacing="md">
            <Button
              onClick={handleShare}
              style={{ backgroundColor: '#CE0E2D', fontFamily: 'Poppins, sans-serif' }}
              className="text-white hover:opacity-90 font-medium rounded-lg transition-all"
              size="lg"
              fullWidth
              leftSection={<Share2 className="h-5 w-5" />}
            >
              Share with Friends
            </Button>

            <Group grow>
              <Button
                variant="outline"
                onClick={() => navigate(`/${franchiseeSlug}`)}
                style={{ borderColor: '#031E4D', color: '#031E4D', fontFamily: 'Poppins, sans-serif' }}
                className="hover:bg-gray-50 font-medium rounded-lg transition-all"
              >
                Back to Home
              </Button>
              {franchiseeSettings.website_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(franchiseeSettings.website_url, '_blank')}
                  style={{ borderColor: '#031E4D', color: '#031E4D', fontFamily: 'Poppins, sans-serif' }}
                  className="hover:bg-gray-50 font-medium rounded-lg transition-all"
                >
                  Visit Website
                </Button>
              )}
            </Group>

            {/* Social Links */}
            {(franchiseeSettings.facebook_url || franchiseeSettings.instagram_url) && (
              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <Text size="sm" style={{ color: '#031E4D', fontFamily: 'Poppins, sans-serif', marginBottom: '12px' }}>
                  Follow us on social media:
                </Text>
                <Group justify="center" gap="md">
                  {franchiseeSettings.facebook_url && (
                    <Anchor
                      href={franchiseeSettings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: '#1877F2',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                      }}
                      className="hover:opacity-90"
                    >
                      <Facebook className="h-5 w-5" />
                      <Text size="sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                        Facebook
                      </Text>
                    </Anchor>
                  )}
                  {franchiseeSettings.instagram_url && (
                    <Anchor
                      href={franchiseeSettings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        background: 'linear-gradient(45deg, #E4405F, #5851DB, #833AB4)',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                      }}
                      className="hover:opacity-90"
                    >
                      <Instagram className="h-5 w-5" />
                      <Text size="sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                        Instagram
                      </Text>
                    </Anchor>
                  )}
                </Group>
              </div>
            )}
          </Stack>

          {/* Confirmation Email Notice */}
          <Card className="bg-blue-50 border border-blue-200" padding="md" radius="md">
            <Text className="font-poppins text-blue-800 text-center" size="sm">
              📧 A confirmation email has been sent to {booking.parent_email}
            </Text>
          </Card>
        </Stack>
      </div>
    </div>
  );
};

export default BookingConfirmation;
