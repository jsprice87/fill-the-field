import React, { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, Clock, MapPin, Loader, User, UserPlus } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DateSelector from '@/components/booking/DateSelector';
import ParticipantForm from '@/components/booking/ParticipantForm';
import ParentContactForm from '@/components/booking/ParentContactForm';
import { ParentGuardianAgreements } from '@/components/booking/ParentGuardianAgreements';
import BookingSuccess from '@/components/booking/BookingSuccess';
import { WaiverModal } from '@/components/booking/WaiverModal';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';

interface ClassBookingProps {
  franchiseeId?: string;
}

const ClassBooking: React.FC<ClassBookingProps> = ({ franchiseeId: propFranchiseeId }) => {
  const { classScheduleId, franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [classData, setClassData] = useState <{
    class_name: string;
    min_age: number;
    max_age: number;
    max_capacity: number;
    location_name: string;
    location_address: string;
    location_city: string;
    location_state: string;
    location_zip: string;
    class_time: string;
    is_active: boolean;
    allow_future_bookings: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Array<{ first_name: string; last_name: string; age: number }>>([{ first_name: '', last_name: '', age: 5 }]);
  const [parentContact, setParentContact] = useState<{ first_name: string; last_name: string; email: string; phone: string }>({ first_name: '', last_name: '', email: '', phone: '' });
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [communicationPermission, setCommunicationPermission] = useState(false);
  const [marketingPermission, setMarketingPermission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [waiverOpened, setWaiverOpened] = useState(false);
  const [metaPixelEventId, setMetaPixelEventId] = useState<string | null>(null);

  const [franchiseeDbId, setFranchiseeDbId] = useState<string | null>(propFranchiseeId || null);

  // Get franchisee ID on component mount
  useEffect(() => {
    if (propFranchiseeId) {
      setFranchiseeDbId(propFranchiseeId);
      return;
    }
  }, [propFranchiseeId]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classScheduleId) {
        setError('Class Schedule ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('class_schedules')
          .select(`
            *,
            classes (
              name,
              class_name,
              min_age,
              max_age,
              max_capacity,
              is_active,
              locations (
                name,
                address,
                city,
                state,
                zip
              )
            )
          `)
          .eq('id', classScheduleId)
          .single();

        if (error) {
          console.error('Error fetching class details:', error);
          setError('Failed to load class details. Please try again.');
        } else if (!data || !data.classes) {
          setError('Class details not found.');
        } else {
          // TODO: replace with proper type
          const classDetails = data as any;
          setClassData({
            class_name: classDetails.classes.class_name,
            min_age: classDetails.classes.min_age,
            max_age: classDetails.classes.max_age,
            max_capacity: classDetails.classes.max_capacity,
            location_name: classDetails.classes.locations.name,
            location_address: classDetails.classes.locations.address,
            location_city: classDetails.classes.locations.city,
            location_state: classDetails.classes.locations.state,
            location_zip: classDetails.classes.locations.zip,
            class_time: classDetails.start_time,
            is_active: classDetails.classes.is_active,
            allow_future_bookings: true // TODO: add to database
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching class details:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classScheduleId]);

  const isFormComplete = () => {
    if (!selectedDate) return false;
    if (!parentContact.first_name || !parentContact.last_name || !parentContact.email || !parentContact.phone) return false;
    if (!waiverAccepted || !communicationPermission) return false;
    if (participants.some(p => !p.first_name || !p.last_name || !p.age)) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      toast.error('Please fill out all required fields and accept the agreements.');
      return;
    }

    if (!classData) {
      toast.error('Class data is not loaded yet. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare participants array
      const appointments = participants.map(participant => ({
        participant_name: `${participant.first_name} ${participant.last_name}`,
        class_name: classData.class_name,
        selected_date: selectedDate,
        class_time: classData.class_time,
        age: participant.age
      }));

      // Construct booking data without appointments array
      const bookingData = {
        franchisee_id: franchiseeDbId,
        parent_first_name: parentContact.first_name,
        parent_last_name: parentContact.last_name,
        parent_email: parentContact.email,
        parent_phone: parentContact.phone,
        communication_permission: communicationPermission,
        marketing_permission: marketingPermission,
        waiver_acceptance: waiverAccepted,
        class_schedule_id: classScheduleId,
        lead_id: 'temp-lead-id', // TODO: generate proper lead
        utm_source: new URLSearchParams(location.search).get('utm_source'),
        utm_medium: new URLSearchParams(location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(location.search).get('utm_campaign'),
        utm_term: new URLSearchParams(location.search).get('utm_term'),
        utm_content: new URLSearchParams(location.search).get('utm_content')
      };

      // Insert booking data into Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        toast.error('Failed to create booking. Please try again.');
        return;
      }

      // Set booking data for success page
      setBookingData(data);

      // Generate URL parameters for the thank you page
      const params = new URLSearchParams({
        ref: data.booking_reference,
        child: appointments[0].participant_name,
        class: classData.class_name,
        date: new Date(selectedDate || '').toLocaleDateString(),
        time: classData.class_time,
        location: classData.location_name
      });

      // Navigate to the thank you page with URL parameters
      navigate(`/${franchiseeSlug}/booking/thank-you?${params.toString()}`);

    } catch (err) {
      console.error('Unexpected error during booking:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMetaPixelTracking = () => {
    // Set a state variable to indicate that the Meta Pixel event should be tracked
    setMetaPixelEventId(Date.now().toString());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
            <p>{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingData) {
    return (
      <MetaPixelProvider franchiseeId={franchiseeDbId}>
        <BookingSuccess
          bookingData={bookingData}
          franchiseeSlug={franchiseeSlug || ''}
          onMetaPixelTracking={handleMetaPixelTracking}
        />
      </MetaPixelProvider>
    );
  }

  return (
    <MetaPixelProvider franchiseeId={franchiseeDbId}>
      <div className="container mx-auto mt-8 p-4 max-w-3xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Book Your Free Trial</CardTitle>
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="py-2 px-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Date:</h4>
                <Badge variant="secondary">{new Date(selectedDate || '').toLocaleDateString()}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Time:</h4>
                <Badge variant="secondary">{classData.class_time}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Location:</h4>
                <Badge variant="secondary">
                  {classData.location_name}, {classData.location_city}, {classData.location_state}
                </Badge>
              </div>
            </div>

            <DateSelector
              classScheduleId={classScheduleId || ''}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate || undefined}
            />

            <ParticipantForm
              participants={participants}
              setParticipants={setParticipants}
              minAge={classData.min_age}
              maxAge={classData.max_age}
              maxCapacity={classData.max_capacity}
            />

            <ParentContactForm
              parentContact={parentContact}
              setParentContact={setParentContact}
            />

            <ParentGuardianAgreements
              waiverAccepted={waiverAccepted}
              communicationPermission={communicationPermission}
              marketingPermission={marketingPermission}
              onWaiverChange={(checked) => setWaiverAccepted(checked)}
              onCommunicationPermissionChange={(checked) => setCommunicationPermission(checked)}
              onMarketingPermissionChange={(checked) => setMarketingPermission(checked)}
              onOpenWaiver={() => setWaiverOpened(true)}
            />

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!isFormComplete() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Free Trial Booking'
              )}
            </Button>
          </CardContent>
        </Card>

        <WaiverModal
          opened={waiverOpened}
          onClose={() => setWaiverOpened(false)}
        />
      </div>
    </MetaPixelProvider>
  );
};

export default ClassBooking;
