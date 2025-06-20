import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@mantine/core';
import { Button } from '@mantine/core';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ClassDetails from '@/components/booking/ClassDetails';
import DateSelector from '@/components/booking/DateSelector';
import ParticipantForms from '@/components/booking/ParticipantForms';
import ParentGuardianForm from '@/components/booking/ParentGuardianForm';
import BookingSuccess from '@/components/booking/BookingSuccess';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useClassSchedule } from '@/hooks/useClassSchedule';
import { notify } from '@/utils/notify';

const ClassBooking: React.FC = () => {
  const { franchiseeSlug, classScheduleId } = useParams<{ franchiseeSlug: string; classScheduleId: string }>();
  const navigate = useNavigate();

  const { data: classSchedule, isLoading: isClassLoading } = useClassSchedule(classScheduleId || '');
  const {
    flowData,
    updateFlow,
    resetFlow,
    isSubmitting,
    submitBooking,
    bookingSuccessData,
    error,
  } = useBookingFlow(classScheduleId || '');

  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (classSchedule && !selectedDate) {
      // Set default selected date to the first available date
      setSelectedDate(classSchedule.availableDates?.[0]?.date);
    }
  }, [classSchedule, selectedDate]);

  useEffect(() => {
    // Reset flow when classScheduleId changes
    resetFlow();
  }, [classScheduleId, resetFlow]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    updateFlow({ selectedDate: date });
  };

  const handleBack = () => {
    navigate(`/${franchiseeSlug}/booking`);
  };

  if (isClassLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!classSchedule) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">Class schedule not found.</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          Back to Classes
        </Button>
      </div>
    );
  }

  if (bookingSuccessData) {
    return (
      <BookingSuccess
        bookingData={bookingSuccessData}
        franchiseeSlug={franchiseeSlug || ''}
        onMetaPixelTracking={() => {
          // Optional: Add Meta Pixel tracking here
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft />}>
        Back to Classes
      </Button>

      <Card>
        <Card.Section className="flex items-center gap-4 p-4 border-b">
          <Calendar className="h-6 w-6 text-brand-blue" />
          <h2 className="font-agrandir text-xl text-brand-navy">{classSchedule.classes.name}</h2>
          <Badge variant="default" className="ml-auto">
            {classSchedule.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </Card.Section>

        <Card.Section className="p-4 space-y-4">
          <ClassDetails classSchedule={classSchedule} />

          <DateSelector
            classScheduleId={classScheduleId || ''}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />

          <ParentGuardianForm flowData={flowData} updateFlow={updateFlow} />

          <ParticipantForms
            flowData={flowData}
            updateFlow={updateFlow}
          />

          {error && (
            <p className="text-red-600 font-poppins text-sm">{error}</p>
          )}

          <Button
            onClick={submitBooking}
            disabled={isSubmitting}
            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
            size="lg"
          >
            {isSubmitting ? 'Booking...' : 'Complete Booking'}
          </Button>
        </Card.Section>
      </Card>
    </div>
  );
};

export default ClassBooking;
