import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@mantine/core';
import { CheckCircle, Calendar, MapPin, Clock, User, Share2, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookingConfirmationProps {
  franchiseeId?: string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ franchiseeId: propFranchiseeId }) => {
  const { franchiseeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFranchiseeId, setCurrentFranchiseeId] = useState<string | null>(propFranchiseeId || null);

  useEffect(() => {
    if (propFranchiseeId) {
      setCurrentFranchiseeId(propFranchiseeId);
      return;
    }

    const getFranchiseeId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("Authentication required");
          return;
        }

        const { data: franchisee, error } = await supabase
          .from('franchisees')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (error || !franchisee) {
          console.error("Error fetching franchisee:", error);
          toast.error("Unable to find franchisee account");
          return;
        }
        
        setCurrentFranchiseeId(franchisee.id);
      } catch (error) {
        console.error("Error getting franchisee:", error);
        toast.error("Failed to authenticate");
      }
    };

    getFranchiseeId();
  }, [propFranchiseeId]);

  useEffect(() => {
    const fetchBookingConfirmation = async () => {
      setIsLoading(true);
      setError(null);
      const bookingReference = searchParams.get('booking_reference');

      if (!bookingReference || !currentFranchiseeId) {
        setError('Booking reference is missing or franchisee ID is not available.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            booking_reference,
            parent_first_name,
            parent_last_name,
            parent_email,
            appointments (
              participant_name,
              class_name,
              selected_date,
              class_time
            ),
            class_schedules (
              classes (
                locations (
                  name,
                  address,
                  city,
                  state,
                  zip
                )
              )
            )
          `)
          .eq('booking_reference', bookingReference)
          .eq('franchisee_id', currentFranchiseeId)
          .single() as any;

        if (error) {
          console.error('Error fetching booking:', error);
          setError('Failed to load booking confirmation.');
        } else if (data) {
          setBookingData(data as any); // TODO: replace with proper type
        } else {
          setError('Booking not found.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to load booking confirmation.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentFranchiseeId) {
      fetchBookingConfirmation();
    }
  }, [searchParams, currentFranchiseeId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!bookingData) return;

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
      toast.success('Booking link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading booking confirmation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No booking data found.</p>
      </div>
    );
  }

  const appointment = bookingData.appointments[0];
  const location = bookingData.class_schedules.classes.locations;

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-6 pb-0">
          <div className="flex items-center space-x-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle className="text-xl font-semibold">Booking Confirmed!</CardTitle>
              <p className="text-gray-500">Reference: {bookingData.booking_reference}</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Confirmed</Badge>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 mb-4">
            Dear {bookingData.parent_first_name} {bookingData.parent_last_name},
            <br />
            Your booking has been successfully confirmed. We look forward to seeing {appointment?.participant_name}!
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-semibold mb-2">Booking Details</h4>
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>Participant: {appointment?.participant_name}</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Date: {appointment?.selected_date ? format(new Date(appointment.selected_date), 'MMMM dd, yyyy') : 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Time: {appointment?.class_time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>
                Location: {location?.name}, {location?.address}, {location?.city}, {location?.state}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="w-full sm:w-auto" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              Print Confirmation
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to {bookingData.parent_email}.
            </p>
          </div>
        </CardContent>
      </Card>
      <Button
        component="a"
        href={`/${franchiseeSlug}/booking`}
        variant="ghost"
        className="mt-4 flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Booking Page</span>
      </Button>
    </div>
  );
};

export default BookingConfirmation;
