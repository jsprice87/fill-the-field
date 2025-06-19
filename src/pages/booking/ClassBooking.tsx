import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Stack, Title, Text, Group, Button, Alert } from '@mantine/core';
import { supabase } from '@/integrations/supabase/client';
import { ClassScheduleCard } from '@/components/booking/ClassScheduleCard';
import { ParticipantModal } from '@/components/booking/ParticipantModal';
import { ParentGuardianForm } from '@/components/booking/ParentGuardianForm';
import { ParentGuardianAgreements } from '@/components/booking/ParentGuardianAgreements';
import { useSearchParams } from 'react-router-dom';
import { notify } from '@/utils/notify';
import { IconInfoCircle } from '@tabler/icons-react';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';
import { useMetaPixelTracking } from '@/components/booking/MetaPixelProvider';
import { useFranchiseeProfile } from '@/hooks/useFranchiseeProfile';
import { useLocations } from '@/hooks/useLocations';

const ClassBooking: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('location');

  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waiverOpened, setWaiverOpened] = useState(false);
  const [waiverText, setWaiverText] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: '',
    relationship: '',
    waiverAccepted: false,
    communicationPermission: true,
    marketingPermission: false,
  });

  const { trackEvent } = useMetaPixelTracking();
  const { data: franchiseeProfile } = useFranchiseeProfile();

  useEffect(() => {
    if (franchiseeProfile?.settings?.waiver_text) {
      setWaiverText(franchiseeProfile.settings.waiver_text);
    }
  }, [franchiseeProfile?.settings?.waiver_text]);

  useEffect(() => {
    if (classId) {
      fetchClassSchedules(classId);
    }
  }, [classId]);

  const fetchClassSchedules = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('class_schedules')
        .select(`
          *,
          classes (
            name,
            description,
            min_age,
            max_age
          )
        `)
        .eq('class_id', classId)
        .eq('location_id', locationId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching class schedules:', error);
        notify('error', 'Failed to load class schedules');
      } else {
        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Error fetching class schedules:', error);
      notify('error', 'Failed to load class schedules');
    }
  };

  const handleScheduleSelect = (schedule: any) => {
    setSelectedSchedule(schedule);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAgreementChange = (field: string, checked: boolean) => {
    setFormData({ ...formData, [field]: checked });
  };

  const handleAddParticipant = async (participant: any) => {
    setParticipants([...participants, participant]);
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const allRequiredFieldsFilled = () => {
    const { firstName, lastName, email, phone, zip } = formData;
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      email.trim() !== '' &&
      phone.trim() !== '' &&
      zip.trim() !== '' &&
      formData.waiverAccepted &&
      formData.communicationPermission
    );
  };

  const handleSubmit = async () => {
    if (!selectedSchedule) {
      setError('Please select a class schedule.');
      return;
    }

    if (!allRequiredFieldsFilled()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (participants.length === 0) {
      setError('Please add at least one participant.');
      return;
    }

    // All checks passed, clear any existing error
    setError(null);

    // Track event
    trackEvent('initiate_checkout', {
      content_name: selectedSchedule?.classes?.name,
      content_category: 'class',
      num_items: participants.length,
      value: selectedSchedule?.price || 0,
      currency: 'USD',
    });

    // Navigate to confirmation page
    navigate('/booking/confirm', {
      state: {
        selectedSchedule,
        formData,
        participants,
      },
    });
  };

  const { data: locations } = useLocations();

  const selectedLocation = locations?.find((loc: any) => loc.id === locationId);

  return (
    <MetaPixelProvider franchiseeId={franchiseeProfile?.id || ''}>
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Title order={2} align="center">
            Confirm Your Class
          </Title>

          {selectedLocation && (
            <Alert
              icon={<IconInfoCircle size="1rem" />}
              title="Location Selected"
              color="blue"
            >
              You have selected the <strong>{selectedLocation.name}</strong> location.
            </Alert>
          )}

          {schedules.length > 0 ? (
            <>
              <Title order={3}>Available Class Times</Title>
              <Group direction="column" align="stretch" grow>
                {schedules.map((schedule) => (
                  <ClassScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onSelect={handleScheduleSelect}
                    isSelected={selectedSchedule?.id === schedule.id}
                  />
                ))}
              </Group>

              <Title order={3}>Parent/Guardian Information</Title>
              <ParentGuardianForm
                formData={formData}
                onInputChange={handleInputChange}
              />

              <Title order={3}>Agreements</Title>
              <ParentGuardianAgreements
                waiverAccepted={formData.waiverAccepted}
                communicationPermission={formData.communicationPermission}
                marketingPermission={formData.marketingPermission}
                onWaiverChange={(checked) => handleAgreementChange('waiverAccepted', checked)}
                onCommunicationPermissionChange={(checked) =>
                  handleAgreementChange('communicationPermission', checked)
                }
                onMarketingPermissionChange={(checked) =>
                  handleAgreementChange('marketingPermission', checked)
                }
                onOpenWaiver={() => setWaiverOpened(true)}
              />

              <Title order={3}>Participants</Title>
              {participants.map((participant, index) => (
                <Alert
                  key={index}
                  title={participant.first_name}
                  color="teal"
                  withCloseButton
                  onClose={() => handleRemoveParticipant(index)}
                >
                  Birth Date:{' '}
                  {new Date(participant.birth_date).toLocaleDateString()}
                </Alert>
              ))}

              <Button onClick={() => setIsModalOpen(true)}>Add Participant</Button>

              {error && <Alert color="red">{error}</Alert>}

              <Button
                size="lg"
                fullWidth
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!selectedSchedule || isSubmitting}
              >
                Continue to Confirmation
              </Button>
            </>
          ) : (
            <Text align="center">No classes available for this location.</Text>
          )}
        </Stack>

        <ParticipantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddParticipant}
          classSchedule={selectedSchedule}
        />

        {/* Waiver Modal */}
        <Modal
          opened={waiverOpened}
          onClose={() => setWaiverOpened(false)}
          title="Liability Waiver and Release"
          size="xl"
        >
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title order={3} size="lg" mb="md">Liability Waiver and Release</Title>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }} mb="md">
              {waiverText || `I acknowledge that participation in soccer activities involves certain inherent risks including, but not limited to, the risk of injury. I voluntarily assume all risks associated with participation and agree to release and hold harmless Soccer Stars, its instructors, and facility owners from any claims arising from participation in this program.

I confirm that my child is physically capable of participating in soccer activities and has no medical conditions that would prevent safe participation.

I grant permission for emergency medical treatment if needed during program activities.`}
            </Text>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="preview-accept" className="rounded" />
              <label htmlFor="preview-accept" className="text-sm">
                I have read and accept the terms of this waiver
              </label>
            </div>
          </div>
        </Modal>
      </Container>
    </MetaPixelProvider>
  );
};

export default ClassBooking;
