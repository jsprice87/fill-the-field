import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DateSelector from '@/components/booking/DateSelector';
import ParticipantForm from '@/components/booking/ParticipantForm';
import ParentGuardianForm from '@/components/booking/ParentGuardianForm';
import ParentGuardianAgreements from '@/components/booking/ParentGuardianAgreements';
import BookingSuccess from '@/components/booking/BookingSuccess';
import WaiverModal from '@/components/booking/WaiverModal';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';
import { useCreateBooking } from '@/hooks/useCreateBooking';
import { formatTimeInTimezone, formatDateInTimezone } from '@/utils/timezoneUtils';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  date_start: string | null;
  date_end: string | null;
  day_of_week: number;
  current_bookings: number;
  max_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  classes: {
    name: string;
    class_name: string;
    description: string;
    duration_minutes: number;
    max_capacity: number;
    min_age: number;
    max_age: number;
    is_active: boolean;
    locations: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
  };
}

const ClassBooking: React.FC = () => {
  const { classScheduleId, franchiseeSlug } = useParams<{ classScheduleId: string; franchiseeSlug: string }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [parentInfo, setParentInfo] = useState<any>({});
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [communicationPermission, setCommunicationPermission] = useState(false);
  const [marketingPermission, setMarketingPermission] = useState(false);
  const [isWaiverOpen, setIsWaiverOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [metaPixelEventId, setMetaPixelEventId] = useState<string | null>(null);

  const { data: settings } = useFranchiseeSettings();
  const timezone = settings?.timezone || 'America/New_York';

  const { 
    mutate: createBooking, 
    isLoading: isBooking,
    isSuccess: bookingSuccess
  } = useCreateBooking();

  const { data: classSchedule, isLoading, isError } = useQuery<ClassSchedule, Error>(
    ['classSchedule', classScheduleId],
    async () => {
      const { data, error } = await supabase
        .from('class_schedules')
        .select(`
          *,
          classes (
            name,
            class_name,
            description,
            duration_minutes,
            max_capacity,
            min_age,
            max_age,
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
        throw new Error(error.message);
      }

      return data as ClassSchedule;
    }
  );

  useEffect(() => {
    if (classSchedule) {
      // Pre-fill one participant
      setParticipants([{ name: '', age: 5 }]);
    }
  }, [classSchedule]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleParticipantChange = (index: number, field: string, value: any) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index] = { ...updatedParticipants[index], [field]: value };
    setParticipants(updatedParticipants);
  };

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: '', age: 5 }]);
  };

  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
  };

  const handleParentInfoChange = (field: string, value: any) => {
    setParentInfo({ ...parentInfo, [field]: value });
  };

  const handleOpenWaiver = () => {
    setIsWaiverOpen(true);
  };

  const handleCloseWaiver = () => {
    setIsWaiverOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (participants.some(p => !p.name || !p.age)) {
      toast.error('Please fill in all participant details');
      return;
    }

    if (!parentInfo.firstName || !parentInfo.lastName || !parentInfo.email || !parentInfo.phone) {
      toast.error('Please fill in all parent/guardian details');
      return;
    }

    if (!waiverAccepted || !communicationPermission) {
      toast.error('You must accept the waiver and communication permission');
      return;
    }

    const formattedTime = formatTimeInTimezone(classSchedule?.start_time || '', timezone, 'h:mm A z');
    const formattedDate = formatDateInTimezone(selectedDate, timezone, 'MMMM dd, yyyy');

    const bookingDetails = {
      class_schedule_id: classScheduleId,
      selected_date: selectedDate,
      class_time: formattedTime,
      participants: participants.map(p => ({
        participant_name: p.name,
        participant_age: p.age
      })),
      parent_first_name: parentInfo.firstName,
      parent_last_name: parentInfo.lastName,
      parent_email: parentInfo.email,
      parent_phone: parentInfo.phone,
      marketing_permission: marketingPermission,
      communication_permission: communicationPermission,
      waiver_acceptance: waiverAccepted,
      timezone: timezone
    };

    createBooking(bookingDetails, {
      onSuccess: (data, variables, context) => {
        setBookingData(data);
        setMetaPixelEventId(data.booking_reference);
      },
      onError: (error, variables, context) => {
        toast.error(`Booking failed: ${error.message}`);
      }
    });
  };

  const onMetaPixelTracking = () => {
    if (metaPixelEventId) {
      window.fbq('track', 'CompleteRegistration', {
        content_name: classSchedule?.classes.name,
        content_category: 'Free Trial Booking',
        value: 0,
        currency: 'USD'
      }, { eventID: metaPixelEventId });
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading class details...</div>;
  }

  if (isError || !classSchedule) {
    return <div className="text-center">Error loading class details. Please check the URL or try again later.</div>;
  }

  if (bookingSuccess && bookingData) {
    return (
      <MetaPixelProvider franchiseeId={bookingData.franchisee_id}>
        <BookingSuccess 
          bookingData={bookingData}
          franchiseeSlug={franchiseeSlug}
          onMetaPixelTracking={onMetaPixelTracking}
        />
      </MetaPixelProvider>
    );
  }

  const location = classSchedule.classes.locations;
  const classTime = formatTimeInTimezone(classSchedule.start_time, timezone, 'h:mm A z');
  const classDate = selectedDate ? formatDateInTimezone(selectedDate, timezone, 'MMMM dd, yyyy') : 'No date selected';

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Book Your Free Trial</CardTitle>
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{classSchedule.classes.name}</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location.name}, {location.city}, {location.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{classDate} at {classTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{classSchedule.classes.min_age} - {classSchedule.classes.max_age} years</span>
            </div>
            <Badge variant="secondary">
              {classSchedule.current_bookings} / {classSchedule.classes.max_capacity} spots taken
            </Badge>
          </div>

          <Separator />

          <DateSelector
            classScheduleId={classScheduleId}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />

          <Separator />

          <ParticipantForm
            participants={participants}
            onParticipantChange={handleParticipantChange}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />

          <Separator />

          <ParentGuardianForm onParentInfoChange={handleParentInfoChange} />

          <ParentGuardianAgreements
            waiverAccepted={waiverAccepted}
            communicationPermission={communicationPermission}
            marketingPermission={marketingPermission}
            onWaiverChange={(checked) => setWaiverAccepted(checked)}
            onCommunicationPermissionChange={(checked) => setCommunicationPermission(checked)}
            onMarketingPermissionChange={(checked) => setMarketingPermission(checked)}
            onOpenWaiver={handleOpenWaiver}
          />

          <Button onClick={handleSubmit} className="w-full" disabled={isBooking}>
            {isBooking ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Booking...
              </>
            ) : (
              "Confirm Free Trial Booking"
            )}
          </Button>
        </CardContent>
      </Card>

      <WaiverModal isOpen={isWaiverOpen} onClose={handleCloseWaiver} />
    </div>
  );
};

export default ClassBooking;
