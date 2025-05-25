import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingSession } from '@/hooks/useBookingSession';
import { toast } from 'sonner';
import ParticipantModal from '@/components/booking/ParticipantModal';
import ParticipantsSummary from '@/components/booking/ParticipantsSummary';

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
  const { franchiseeId } = useParams();
  const { sessionData, addParticipant, removeParticipant, getLeadData, getParticipantCountForClass } = useBookingSession();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const leadData = getLeadData();

  useEffect(() => {
    // Wait for session to load from localStorage
    const checkSessionTimer = setTimeout(() => {
      console.log('Session data after delay:', sessionData);
      setIsSessionLoaded(true);
      
      // Only redirect if we're sure session is loaded and no location is selected
      if (!sessionData.selectedLocation?.id) {
        console.log('No location selected after session loaded, redirecting to find classes');
        window.location.href = `/${franchiseeId}/free-trial/find-classes`;
        return;
      }
      
      loadClasses();
    }, 300); // Give more time for localStorage to load

    return () => clearTimeout(checkSessionTimer);
  }, [sessionData, franchiseeId]);

  const loadClasses = async () => {
    if (!sessionData.selectedLocation?.id) {
      toast.error('Please select a location first');
      return;
    }

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
        .eq('classes.location_id', sessionData.selectedLocation.id)
        .eq('is_active', true)
        .eq('classes.is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        throw error;
      }

      setClasses(classesData || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = (classSchedule: ClassSchedule) => {
    setSelectedClass(classSchedule);
    setIsModalOpen(true);
  };

  const handleParticipantAdded = (participant: any) => {
    addParticipant(participant);
    toast.success(`${participant.firstName} ${participant.lastName} added to ${participant.className}`);
  };

  const handleContinueToConfirmation = async () => {
    const participants = sessionData.participants || [];
    const parentInfo = sessionData.parentGuardianInfo;
    const leadId = sessionData.leadId;

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
          class_schedule_id: participants[0].classScheduleId, // Use first participant's class
          parent_first_name: parentInfo.firstName,
          parent_last_name: parentInfo.lastName,
          parent_email: parentInfo.email,
          parent_phone: parentInfo.phone,
          parent_zip: parentInfo.zip,
          parent_relationship: parentInfo.relationship,
          waiver_accepted: sessionData.waiverAccepted,
          waiver_accepted_at: sessionData.waiverAccepted ? new Date().toISOString() : null,
          communication_permission: sessionData.communicationPermission,
          marketing_permission: sessionData.marketingPermission,
          child_speaks_english: sessionData.childSpeaksEnglish,
          status: 'confirmed'
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
            selected_date: participant.selectedDate, // Include the selected date
            health_conditions: participant.healthConditions,
            age_override: participant.ageOverride,
            status: 'confirmed'
          })
      );

      const appointmentResults = await Promise.all(appointmentPromises);
      
      // Check for appointment creation errors
      for (const result of appointmentResults) {
        if (result.error) {
          console.error('Appointment creation error:', result.error);
          throw result.error;
        }
      }

      console.log('All appointments created successfully');

      // Update lead status to converted
      await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', leadId);

      // Navigate to confirmation page with booking ID
      window.location.href = `/${franchiseeId}/free-trial/booking/${booking.id}`;
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const handleBackToLocations = () => {
    window.location.href = `/${franchiseeId}/free-trial/find-classes`;
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
    return sessionData.participants?.length || 0;
  };

  const canAddMoreParticipants = () => {
    return getTotalParticipants() < 5;
  };

  // Convert ParticipantData to the format expected by ParticipantsSummary
  const convertedParticipants = (sessionData.participants || []).map((p, index) => ({
    id: p.id || `temp-${index}`,
    firstName: p.firstName,
    lastName: p.lastName,
    birthDate: p.birthDate,
    age: p.age,
    classScheduleId: p.classScheduleId,
    className: p.className,
    classTime: p.classTime,
    selectedDate: p.selectedDate,
    healthConditions: p.healthConditions,
    ageOverride: p.ageOverride
  }));

  const handleRemoveParticipant = (participantId: string) => {
    removeParticipant(participantId);
  };

  if (isLoading || !isSessionLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600">Loading classes...</p>
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
          {sessionData.selectedLocation && (
            <div className="flex items-center mt-2 ml-12">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="font-poppins text-sm opacity-90">
                {sessionData.selectedLocation.name}
              </span>
            </div>
          )}
          {leadData && (
            <p className="font-poppins text-sm opacity-75 ml-12">
              Hello {leadData.firstName}, add participants to your free trial classes below
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

          {/* Participants Summary */}
          <div className="lg:col-span-1">
            <ParticipantsSummary
              participants={convertedParticipants}
              onRemoveParticipant={handleRemoveParticipant}
              onContinue={handleContinueToConfirmation}
            />
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
