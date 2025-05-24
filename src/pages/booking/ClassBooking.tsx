
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingSession } from '@/hooks/useBookingSession';
import { toast } from 'sonner';

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
  const { sessionData, updateSession } = useBookingSession();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadClasses();
  }, [sessionData.selectedLocation]);

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

  const handleClassSelect = (classSchedule: ClassSchedule) => {
    updateSession({
      selectedClasses: [{
        id: classSchedule.id,
        name: classSchedule.classes.name,
        date: dayNames[classSchedule.day_of_week],
        time: `${classSchedule.start_time} - ${classSchedule.end_time}`
      }]
    });
    
    // Navigate to confirmation
    window.location.href = `/${franchiseeId}/free-trial/confirmation`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableSpots = (classSchedule: ClassSchedule) => {
    return classSchedule.classes.max_capacity - classSchedule.current_bookings;
  };

  if (isLoading) {
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
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - BOOK CLASS</h1>
          {sessionData.selectedLocation && (
            <div className="flex items-center mt-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="font-poppins text-sm opacity-90">
                {sessionData.selectedLocation.name}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-agrandir text-3xl text-brand-navy mb-8">Select a Class</h2>
        
        <div className="space-y-4">
          {classes.length > 0 ? (
            classes.map((classSchedule) => (
              <Card key={classSchedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="font-agrandir text-xl text-brand-navy mb-2">
                        {classSchedule.classes.name}
                      </CardTitle>
                      
                      {classSchedule.classes.description && (
                        <p className="font-poppins text-gray-600 mb-3">
                          {classSchedule.classes.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-poppins">
                            {dayNames[classSchedule.day_of_week]}s
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="font-poppins">
                            {formatTime(classSchedule.start_time)} - {formatTime(classSchedule.end_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="font-poppins">
                            {getAvailableSpots(classSchedule)} spots available
                          </span>
                        </div>
                      </div>
                      
                      {(classSchedule.classes.min_age || classSchedule.classes.max_age) && (
                        <div className="mt-3">
                          <span className="font-poppins text-sm text-gray-600">
                            Ages: {classSchedule.classes.min_age || 'Any'} - {classSchedule.classes.max_age || 'Any'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6">
                      <Button
                        onClick={() => handleClassSelect(classSchedule)}
                        disabled={getAvailableSpots(classSchedule) <= 0}
                        className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins"
                      >
                        {getAvailableSpots(classSchedule) > 0 ? 'Select Class' : 'Full'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="mb-6">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-agrandir text-xl text-brand-navy mb-2">
                  No Classes Available
                </h3>
                <p className="font-poppins text-gray-600">
                  There are currently no classes scheduled at this location.
                  Please check back later or contact us for more information.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassBooking;
