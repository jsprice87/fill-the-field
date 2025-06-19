import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, User, Mail, Phone, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeData';

interface BookingData {
  childName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childAge: number;
  locationName: string;
  className: string;
  classDate: string;
  classTime: string;
  classId: string;
  locationId: string;
  scheduleId: string;
}

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: franchisee, isLoading: isFranchiseeLoading } = useFranchiseeBySlug(franchiseeSlug as string);

  useEffect(() => {
    // Get booking data from URL params
    const data: BookingData = {
      childName: searchParams.get('childName') || '',
      parentName: searchParams.get('parentName') || '',
      parentEmail: searchParams.get('parentEmail') || '',
      parentPhone: searchParams.get('parentPhone') || '',
      childAge: parseInt(searchParams.get('childAge') || '0'),
      locationName: searchParams.get('locationName') || '',
      className: searchParams.get('className') || '',
      classDate: searchParams.get('classDate') || '',
      classTime: searchParams.get('classTime') || '',
      classId: searchParams.get('classId') || '',
      locationId: searchParams.get('locationId') || '',
      scheduleId: searchParams.get('scheduleId') || '',
    };

    if (!data.childName || !data.parentEmail) {
      toast.error('Missing required booking information');
      navigate(`/booking/${franchiseeSlug}`);
      return;
    }

    setBookingData(data);
  }, [searchParams, franchiseeSlug, navigate]);

  const handleConfirmBooking = async () => {
    if (!bookingData || !franchisee) {
      toast.error('Missing booking information');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the booking - fix field names to match database schema
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          location_id: bookingData.locationId,
          class_id: bookingData.classId,
          class_schedule_id: bookingData.scheduleId,
          first_name: bookingData.childName,
          last_name: '', // Add empty last name since it's required
          email: bookingData.parentEmail,
          phone: bookingData.parentPhone,
          booking_date: new Date().toISOString(),
          status: 'confirmed',
          notes: `Parent: ${bookingData.parentName}, Child Age: ${bookingData.childAge}`,
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        toast.error('Failed to create booking. Please try again.');
        return;
      }

      // Create or update lead - fix field names to match database schema
      const { error: leadError } = await supabase
        .from('leads')
        .upsert({
          franchisee_id: franchisee.id,
          first_name: bookingData.parentName,
          last_name: '', // Add empty last name
          email: bookingData.parentEmail,
          phone: bookingData.parentPhone,
          source: 'booking_form',
          status: 'new',
          notes: `Booked ${bookingData.className} at ${bookingData.locationName}, Child: ${bookingData.childName}, Age: ${bookingData.childAge}`,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email,franchisee_id'
        });

      if (leadError) {
        console.error('Error creating/updating lead:', leadError);
        // Don't fail the booking for lead errors
      }

      toast.success('Booking confirmed successfully!');
      
      // Navigate to thank you page with booking details
      const thankYouParams = new URLSearchParams({
        ref: booking.id.toString(),
        child: bookingData.childName,
        class: bookingData.className,
        date: bookingData.classDate,
        time: bookingData.classTime,
        location: bookingData.locationName,
      });
      
      navigate(`/booking/${franchiseeSlug}/thank-you?${thankYouParams.toString()}`);

    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Go back to class selection with current data
    const params = new URLSearchParams();
    if (bookingData) {
      params.set('childName', bookingData.childName);
      params.set('parentName', bookingData.parentName);
      params.set('parentEmail', bookingData.parentEmail);
      params.set('parentPhone', bookingData.parentPhone);
      params.set('childAge', bookingData.childAge.toString());
    }
    navigate(`/booking/${franchiseeSlug}/location/${bookingData?.locationId}?${params.toString()}`);
  };

  if (isFranchiseeLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Missing Information</h1>
          <p className="text-gray-600 mb-4">Required booking information is missing.</p>
          <Button onClick={() => navigate(`/booking/${franchiseeSlug}`)}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-blue">
            {franchisee?.company_name || 'Soccer Academy'}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirm Your Booking
          </h1>
          <p className="text-lg text-gray-600">
            Please review your booking details below and confirm to complete your registration.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Class Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Class</label>
                <p className="text-lg font-semibold text-gray-900">{bookingData.className}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date & Time</label>
                <p className="text-lg font-semibold text-gray-900">
                  {bookingData.classDate} at {bookingData.classTime}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  {bookingData.locationName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Participant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Child's Name</label>
                <p className="text-lg font-semibold text-gray-900">{bookingData.childName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Age</label>
                <p className="text-lg font-semibold text-gray-900">{bookingData.childAge} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Parent/Guardian</label>
                <p className="text-lg font-semibold text-gray-900">{bookingData.parentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contact</label>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    {bookingData.parentEmail}
                  </p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    {bookingData.parentPhone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">What to Expect</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Arrive 15 minutes early for check-in</li>
            <li>• Bring water and wear comfortable athletic clothing</li>
            <li>• Soccer cleats recommended but not required</li>
            <li>• All equipment will be provided</li>
            <li>• Free trial class - no payment required today</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex-1"
          >
            Back to Edit
          </Button>
          <Button 
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming...
              </div>
            ) : (
              <>
                Confirm Booking
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;
