import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin, ArrowLeft, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { toast } from 'sonner';
import ParticipantModal from '@/components/booking/ParticipantModal';
import ParentGuardianForm from '@/components/booking/ParentGuardianForm';

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  current_bookings: number;
  date_start?: string;
  date_end?: string;
  classes: {
    name: string;
    description?: string;
    min_age?: number;
    max_age?: number;
    max_capacity: number;
    duration_minutes: number;
  };
}

const ClassBooking: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow');
  
  const { 
    flowData, 
    loadFlow, 
    updateFlow, 
    addParticipant, 
    removeParticipant, 
    getParticipantCountForClass,
    isLoading: flowLoading 
  } = useBookingFlow(flowId || undefined, franchiseeSlug);
  
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flowLoaded, setFlowLoaded] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    console.log('ClassBooking: useEffect triggered', { flowId, franchiseeSlug, flowLoaded });
    
    if (!flowId) {
      console.log('No flow ID found, redirecting to landing');
      navigate(`/${franchiseeSlug}/free-trial`);
      return;
    }

    loadFlowData();
  }, [flowId, franchiseeSlug]);

  useEffect(() => {
    console.log('ClassBooking: Flow data effect', { flowLoaded, selectedLocation: flowData.selectedLocation });
    
    if (flowLoaded && flowData.selectedLocation?.id) {
      console.log('Loading classes for location:', flowData.selectedLocation.id);
      loadClasses();
    } else if (flowLoaded && !flowData.selectedLocation?.id) {
      console.log('No location selected, redirecting to find classes');
      navigate(`/${franchiseeSlug}/free-trial/find-classes?flow=${flowId}`);
    }
  }, [flowLoaded, flowData.selectedLocation]);

  const loadFlowData = async () => {
    if (!flowId) return;
    
    console.log('Loading flow data for ID:', flowId);
    setIsLoading(true);
    
    try {
      await loadFlow(flowId);
      console.log('Flow data loaded successfully');
      setFlowLoaded(true);
    } catch (error) {
      console.error('Error loading flow:', error);
      toast.error('Session expired. Please start over.');
      navigate(`/${franchiseeSlug}/free-trial`);
    }
  };

  const loadClasses = async () => {
    if (!flowData.selectedLocation?.id) {
      console.log('Cannot load classes: no location selected');
      return;
    }

    console.log('Loading classes for location:', flowData.selectedLocation.id);
    setIsLoading(true);
    
    try {
      const { data: classesData, error } = await supabase
        .from('class_schedules')
        .select(`
          *,
          classes!inner(
            name,
            description,
            min_age,
            max_age,
            max_capacity,
            duration_minutes,
            location_id
          )
        `)
        .eq('classes.location_id', flowData.selectedLocation.id)
        .eq('is_active', true)
        .eq('classes.is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Error loading classes:', error);
        throw error;
      }

      console.log('Classes loaded:', classesData?.length || 0, 'classes found');
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = (classSchedule: ClassSchedule) => {
    console.log('Adding participant to class:', classSchedule.classes.name);
    setSelectedClass(classSchedule);
    setIsModalOpen(true);
  };

  const handleParticipantAdded = async (participant: any) => {
    try {
      console.log('Participant added:', participant);
      await addParticipant(participant);
      toast.success(`${participant.firstName} ${participant.lastName} added to ${participant.className}`);
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant. Please try again.');
    }
  };

  const handleContinueToConfirmation = async () => {
    const participants = flowData.participants || [];
    const parentInfo = flowData.parentGuardianInfo;
    const leadId = flowData.leadId;

    console.log('Continue to confirmation:', { participants: participants.length, parentInfo: !!parentInfo, leadId });

    if (!parentInfo || !leadId || participants.length === 0) {
      toast.error('Missing required information');
      return;
    }

    try {
      // Create the booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          lead_id: leadId,
          class_schedule_id: participants[0].classScheduleId,
          parent_first_name: parentInfo.firstName,
          parent_last_name: parentInfo.lastName,
          parent_email: parentInfo.email,
          parent_phone: parentInfo.phone,
          parent_zip: parentInfo.zip,
          parent_relationship: parentInfo.relationship,
          waiver_accepted: flowData.waiverAccepted,
          waiver_accepted_at: flowData.waiverAccepted ? new Date().toISOString() : null,
          communication_permission: flowData.communicationPermission,
          marketing_permission: flowData.marketingPermission,
          child_speaks_english: flowData.childSpeaksEnglish
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        throw bookingError;
      }

      console.log('Booking created:', booking);

      // Create appointment records for each participant
      const appointmentPromises = participants.map(participant => 
        supabase
          .from('appointments')
          .insert({
            booking_id: booking.id,
            participant_name: `${participant.firstName} ${participant.lastName}`,
            participant_age: participant.age,
            participant_birth_date: participant.birthDate,
            class_schedule_id: participant.classScheduleId,
            class_name: participant.className,
            class_time: participant.classTime,
            selected_date: participant.selectedDate,
            health_conditions: participant.healthConditions,
            age_override: participant.ageOverride
          })
      );

      const appointmentResults = await Promise.all(appointmentPromises);
      
      for (const result of appointmentResults) {
        if (result.error) {
          console.error('Appointment creation error:', result.error);
          throw result.error;
        }
      }

      console.log('All appointments created successfully');

      // Update lead status to booked_upcoming (since all bookings are future dates)
      await supabase
        .from('leads')
        .update({ status: 'booked_upcoming' })
        .eq('id', leadId);

      navigate(`/${franchiseeSlug}/free-trial/booking/${booking.id}`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const handleBackToLocations = () => {
    if (!flowId) return;
    navigate(`/${franchiseeSlug}/free-trial/find-classes?flow=${flowId}`);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableSpots = (classSchedule: ClassSchedule) => {
    const baseAvailable = classSchedule.classes.max_capacity - classSchedule.current_bookings;
    const sessionParticipants = getParticipantCountForClass(classSchedule.id);
    return baseAvailable - sessionParticipants;
  };

  const getTotalParticipants = () => {
    return flowData.participants?.length || 0;
  };

  const canAddMoreParticipants = () => {
    return getTotalParticipants() < 5;
  };

  // Enhanced validation logic for the confirmation button
  const canConfirmBooking = () => {
    console.log('🔍 Checking if booking can be confirmed...', {
      participants: flowData.participants?.length || 0,
      parentInfo: flowData.parentGuardianInfo,
      waiverAccepted: flowData.waiverAccepted,
      communicationPermission: flowData.communicationPermission
    });

    // Check if we have at least one participant
    const hasParticipants = (flowData.participants?.length || 0) > 0;
    console.log('✅ Has participants:', hasParticipants);

    // Check parent/guardian info with proper field validation
    const parentInfo = flowData.parentGuardianInfo;
    const hasValidParentInfo = !!(
      parentInfo?.firstName?.trim() &&
      parentInfo?.lastName?.trim() &&
      parentInfo?.email?.trim() &&
      parentInfo?.phone?.trim() &&
      parentInfo?.zip?.trim() &&
      parentInfo?.relationship?.trim()
    );
    console.log('✅ Has valid parent info:', hasValidParentInfo, parentInfo);

    // Check required agreements
    const hasWaiver = !!flowData.waiverAccepted;
    const hasCommunicationPermission = !!flowData.communicationPermission;
    console.log('✅ Has waiver:', hasWaiver);
    console.log('✅ Has communication permission:', hasCommunicationPermission);

    const canConfirm = hasParticipants && hasValidParentInfo && hasWaiver && hasCommunicationPermission;
    console.log('🎯 Can confirm booking:', canConfirm);

    return canConfirm;
  };

  // Show loading state while flow is being loaded or classes are being fetched
  if (isLoading || flowLoading || !flowLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600">
            {!flowLoaded ? 'Loading booking session...' : 'Loading classes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              onClick={handleBackToLocations}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-anton text-3xl">SOCCER STARS</h1>
              <h2 className="font-agrandir text-xl">Select Classes & Add Participants</h2>
            </div>
          </div>
          {flowData.selectedLocation && (
            <div className="flex items-center mt-2 ml-12">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="font-poppins text-sm opacity-90">
                {flowData.selectedLocation.name}
              </span>
            </div>
          )}
          {flowData.leadData && (
            <p className="font-poppins text-sm opacity-75 ml-12">
              Hello {flowData.leadData.firstName}, add participants to your free trial classes below
            </p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-agrandir text-2xl text-brand-navy">Available Classes</h3>
              {getTotalParticipants() >= 5 && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
                  <span className="font-poppins text-sm">
                    Maximum 5 participants per booking reached
                  </span>
                </div>
              )}
            </div>
            
            {classes.length > 0 ? (
              classes.map((classSchedule) => {
                const availableSpots = getAvailableSpots(classSchedule);
                const sessionParticipants = getParticipantCountForClass(classSchedule.id);
                
                return (
                  <Card key={classSchedule.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-blue">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="font-agrandir text-xl text-brand-navy mb-2">
                            {classSchedule.classes.name}
                            {sessionParticipants > 0 && (
                              <span className="ml-2 bg-brand-blue text-white text-sm px-2 py-1 rounded font-poppins">
                                {sessionParticipants} added
                              </span>
                            )}
                          </CardTitle>
                          
                          {classSchedule.classes.description && (
                            <p className="font-poppins text-gray-600 mb-4">
                              {classSchedule.classes.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
                              <span className="font-poppins">
                                Every {dayNames[classSchedule.day_of_week]}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-brand-blue" />
                              <span className="font-poppins">
                                {formatTime(classSchedule.start_time)} - {formatTime(classSchedule.end_time)}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2 text-brand-blue" />
                              <span className="font-poppins">
                                {availableSpots} spots available
                              </span>
                            </div>
                          </div>
                          
                          {(classSchedule.classes.min_age || classSchedule.classes.max_age) && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <span className="font-poppins text-sm text-blue-800">
                                👶 Ages: {classSchedule.classes.min_age || 'Any'} - {classSchedule.classes.max_age || 'Any'} years old
                              </span>
                            </div>
                          )}

                          <div className="bg-green-50 rounded-lg p-3">
                            <span className="font-poppins text-sm text-green-800">
                              🆓 This is a FREE trial class - no payment required
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          <Button
                            onClick={() => handleAddParticipant(classSchedule)}
                            disabled={availableSpots <= 0 || !canAddMoreParticipants()}
                            className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins px-6 py-3"
                            size="lg"
                          >
                            {availableSpots <= 0 ? 'Class Full' : 
                             !canAddMoreParticipants() ? 'Max Participants' : 
                             'Add Participant'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 text-center border-l-4 border-l-brand-red">
                <div className="mb-6">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-agrandir text-xl text-brand-navy mb-2">
                    No Classes Available
                  </h3>
                  <p className="font-poppins text-gray-600 mb-6">
                    There are currently no classes scheduled at this location.
                    Please check back later or contact the location directly for more information.
                  </p>
                  <Button
                    onClick={handleBackToLocations}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
                    size="lg"
                  >
                    Choose Different Location
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Participants Summary */}
            {(flowData.participants?.length || 0) > 0 && (
              <Card className="border-l-4 border-l-brand-blue">
                <CardHeader>
                  <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants Added ({flowData.participants?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {flowData.participants?.map((participant, index) => (
                    <div key={participant.id || index} className="flex items-center justify-between bg-gray-50 rounded p-3">
                      <div className="flex-1">
                        <div className="font-poppins font-medium">
                          {participant.firstName} {participant.lastName}
                        </div>
                        <div className="text-sm text-gray-600 font-poppins">
                          {participant.className} - {participant.age} years old
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id || `temp-${index}`)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Parent Guardian Form */}
            <ParentGuardianForm 
              flowData={flowData}
              updateFlow={updateFlow}
            />

            {/* Confirmation Button */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <Button
                  onClick={handleContinueToConfirmation}
                  disabled={!canConfirmBooking()}
                  className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-poppins py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {canConfirmBooking() ? 'Confirm Booking' : 'Complete Required Information'}
                </Button>
                
                {!canConfirmBooking() && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600 font-poppins">
                      Please add at least one participant and complete all required information above.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help section */}
        {classes.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-agrandir text-lg text-brand-navy mb-2">Need Help Choosing?</h4>
            <p className="font-poppins text-gray-600 text-sm">
              All classes are designed to be fun and age-appropriate. You can add multiple children to the same class
              or different classes. If you're unsure which class is best for your child, 
              feel free to contact the location directly using the phone number provided.
            </p>
          </div>
        )}
      </div>

      {/* Participant Modal */}
      {selectedClass && (
        <ParticipantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddParticipant={handleParticipantAdded}
          classSchedule={selectedClass}
          dayNames={dayNames}
        />
      )}
    </div>
  );
};

export default ClassBooking;
