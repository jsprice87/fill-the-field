import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Phone, Mail, Clock, User, Share2, Printer } from 'lucide-react';
import { useBookingConfirmation } from '@/hooks/useBookingConfirmation';
import BookingNotFound from '@/components/booking/BookingNotFound';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

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
  const bookingConfirmationRef = useRef(null);

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
          title: 'Soccer Trial Booking',
          text: message,
          url: shareUrl,
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking || !franchiseeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the booking you're looking for.</p>
          <Button onClick={() => navigate(`/${franchiseeSlug}/free-trial`)}>
            Back to Booking
          </Button>
        </div>
      </div>
    );
  }

  const appointment = booking.appointments[0];
  const location = booking.class_schedules.classes.locations;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-3xl mb-2">SOCCER STARS</h1>
          <h2 className="font-agrandir text-xl">Booking Confirmed!</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Message */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle className="font-agrandir text-xl text-brand-navy">
                  Booking Confirmed!
                </CardTitle>
                <p className="font-poppins text-gray-600 mt-1">
                  Reference: {booking.booking_reference}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-poppins text-gray-700 mb-4">
              Thank you {booking.parent_first_name}! Your free trial has been successfully booked. 
              We're excited to see {appointment.participant_name} on the field!
            </p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-agrandir text-lg text-brand-navy">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-brand-blue mt-1" />
              <div>
                <p className="font-poppins font-medium">Date & Time</p>
                <p className="font-poppins text-gray-600">
                  {format(new Date(appointment.selected_date), 'EEEE, MMMM d, yyyy')} at {appointment.class_time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-brand-blue mt-1" />
              <div>
                <p className="font-poppins font-medium">Class</p>
                <p className="font-poppins text-gray-600">{appointment.class_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-brand-blue mt-1" />
              <div>
                <p className="font-poppins font-medium">Location</p>
                <p className="font-poppins text-gray-600">
                  {location.name}<br />
                  {location.address}, {location.city}, {location.state}
                </p>
                {location.phone && (
                  <p className="font-poppins text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-4 w-4" />
                    {location.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {(franchiseeData.phone || franchiseeData.address || franchiseeSettings.website_url) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-agrandir text-lg text-brand-navy">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {franchiseeData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-brand-blue" />
                  <span className="font-poppins text-gray-700">{franchiseeData.phone}</span>
                </div>
              )}
              
              {franchiseeData.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-brand-blue mt-1" />
                  <span className="font-poppins text-gray-700">
                    {franchiseeData.address}
                    {franchiseeData.city && franchiseeData.state && (
                      <><br />{franchiseeData.city}, {franchiseeData.state}</>
                    )}
                  </span>
                </div>
              )}

              {franchiseeSettings.website_url && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-brand-blue" />
                  <a 
                    href={franchiseeSettings.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-poppins text-brand-blue hover:underline"
                  >
                    Visit our website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleShare}
            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
            size="lg"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share with Friends
          </Button>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/${franchiseeSlug}`)}
              className="flex-1 font-poppins"
            >
              Back to Home
            </Button>
            {franchiseeSettings.website_url && (
              <Button
                variant="outline"
                onClick={() => window.open(franchiseeSettings.website_url, '_blank')}
                className="flex-1 font-poppins"
              >
                Visit Website
              </Button>
            )}
          </div>

          {/* Social Links */}
          {(franchiseeSettings.facebook_url || franchiseeSettings.instagram_url) && (
            <div className="flex justify-center gap-4 pt-4">
              {franchiseeSettings.facebook_url && (
                <a
                  href={franchiseeSettings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:text-brand-blue/80"
                >
                  Follow us on Facebook
                </a>
              )}
              {franchiseeSettings.instagram_url && (
                <a
                  href={franchiseeSettings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:text-brand-blue/80"
                >
                  Follow us on Instagram
                </a>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Email Notice */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-poppins text-blue-800 text-center text-sm">
            📧 A confirmation email has been sent to {booking.parent_email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
