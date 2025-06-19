import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Stack, Alert, Loader } from '@mantine/core';
import { ParentGuardianFormFields } from '@/components/booking/ParentGuardianFormFields';
import { ParentGuardianAgreements } from '@/components/booking/ParentGuardianAgreements';
import { ParticipantList } from '@/components/booking/ParticipantList';
import ParticipantModal, { ParticipantFormData } from '@/components/booking/ParticipantModal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeProfile } from '@/hooks/useFranchiseeProfile';
import { useMetaPixelTracking } from '@/components/booking/MetaPixelProvider';
import { notify } from '@/utils/notify';

const bookingFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  zip: z.string().min(5, 'Zip code must be at least 5 digits').max(5, 'Zip code must be 5 digits'),
  relationship: z.string().optional(),
  waiverAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the waiver to continue' }) }),
  communicationPermission: z.literal(true, { errorMap: () => ({ message: 'You must give permission to be contacted' }) }),
  marketingPermission: z.boolean().default(false),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSchedule = location.state?.selectedSchedule;
  const [participants, setParticipants] = useState<ParticipantFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const { trackEvent } = useMetaPixelTracking();
  const { data: franchisee } = useFranchiseeProfile();

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      marketingPermission: false,
    },
  });

  const waiverAccepted = watch('waiverAccepted');
  const communicationPermission = watch('communicationPermission');
  const marketingPermission = watch('marketingPermission');

  if (!selectedSchedule) {
    return <Alert color="red">No class schedule selected. Please go back and select a class.</Alert>;
  }

  const handleAddParticipant = (newParticipant: ParticipantFormData) => {
    setParticipants([...participants, newParticipant]);
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const handleInputChange = (field: string, value: string) => {
    setValue(field as keyof BookingFormData, value);
  };

  const handleBookingSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);

      // Get the parent data from form
      const parentData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        zip: formData.zip || '', // Add zip field
        relationship: formData.relationship || 'Parent',
        communication_permission: formData.communicationPermission,
        marketing_permission: formData.marketingPermission,
        waiver_accepted: formData.waiverAccepted,
        waiver_accepted_at: formData.waiverAccepted ? new Date().toISOString() : null,
      };

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          class_schedule_id: selectedSchedule.id,
          // Remove location_id as it doesn't exist in the bookings table
          ...parentData,
          booking_reference: `SS-${Date.now()}`,
          status: 'confirmed',
          notes: `Class: ${selectedSchedule.classes.name}. Participants: ${participants.map(p => p.first_name).join(', ')}`
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create lead record
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          franchisee_id: selectedSchedule.franchisee_id,
          first_name: parentData.first_name,
          last_name: parentData.last_name,
          email: parentData.email,
          phone: parentData.phone,
          zip: parentData.zip, // Add zip field
          source: 'booking_form',
          status: 'new' as const,
          notes: `Booking confirmed: ${booking.booking_reference}`,
          updated_at: new Date().toISOString(),
        });

      if (leadError) {
        console.error('Error creating lead:', leadError);
        // Don't fail the booking if lead creation fails
      }

      // Create participant records
      const participantPromises = participants.map(participant =>
        supabase
          .from('participants')
          .insert({
            booking_id: booking.id,
            first_name: participant.first_name,
            birth_date: participant.birth_date,
            notes: participant.notes,
          })
      );

      await Promise.all(participantPromises);

      // Track event
      trackEvent('booking_completed', {
        class_name: selectedSchedule.classes.name,
        num_participants: participants.length,
        class_schedule_id: selectedSchedule.id,
        franchisee_id: selectedSchedule.franchisee_id,
      });

      notify('success', 'Booking Confirmed!');

      // Redirect to success page
      navigate('/booking/success', {
        state: {
          bookingReference: booking.booking_reference,
          className: selectedSchedule.classes.name,
          locationName: selectedSchedule.location.name,
          classDate: selectedSchedule.start_date,
          classTime: selectedSchedule.start_time,
        },
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Booking</h1>
      <p className="mb-4">
        You are booking <strong>{selectedSchedule.classes.name}</strong> at{' '}
        <strong>{selectedSchedule.location.name}</strong>.
      </p>

      {error && <Alert color="red" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit(handleBookingSubmit)}>
        <Stack gap="md">
          <ParentGuardianFormFields
            formData={{
              firstName: watch('firstName') || '',
              lastName: watch('lastName') || '',
              email: watch('email') || '',
              phone: watch('phone') || '',
              zip: watch('zip') || '',
              relationship: watch('relationship') || '',
            }}
            onInputChange={handleInputChange}
          />

          <ParticipantList
            participants={participants}
            onAdd={() => setIsModalOpen(true)}
            onRemove={handleRemoveParticipant}
          />

          <ParentGuardianAgreements
            waiverAccepted={waiverAccepted}
            communicationPermission={communicationPermission}
            marketingPermission={marketingPermission}
            onWaiverChange={(checked) => setValue('waiverAccepted', checked)}
            onCommunicationPermissionChange={(checked) => setValue('communicationPermission', checked)}
            onMarketingPermissionChange={(checked) => setValue('marketingPermission', checked)}
            onOpenWaiver={() => setWaiverOpen(true)}
          />

          <Button type="submit" disabled={isSubmitting || participants.length === 0} className="w-full">
            {isSubmitting ? (
              <>
                <Loader size="sm" color="white" />
                &nbsp;Submitting Booking...
              </>
            ) : (
              'Complete Booking'
            )}
          </Button>
        </Stack>
      </form>

      <ParticipantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddParticipant}
        classSchedule={selectedSchedule}
      />

      {/* Waiver Modal */}
      <Modal
        opened={waiverOpen}
        onClose={() => setWaiverOpen(false)}
        title="Liability Waiver and Release"
        size="xl"
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Liability Waiver and Release</h3>
          <p className="text-sm">
            I acknowledge that participation in soccer activities involves certain inherent risks including, but not
            limited to, the risk of injury. I voluntarily assume all risks associated with participation and agree to
            release and hold harmless Soccer Stars, its instructors, and facility owners from any claims arising from
            participation in this program.
          </p>
          <p className="text-sm mt-2">
            I confirm that my child is physically capable of participating in soccer activities and has no medical
            conditions that would prevent safe participation.
          </p>
          <p className="text-sm mt-2">
            I grant permission for emergency medical treatment if needed during program activities.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BookingConfirmation;
