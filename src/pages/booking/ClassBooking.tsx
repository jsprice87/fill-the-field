import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ClassSchedule {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  date_start?: string;
  date_end?: string;
  is_active: boolean;
  current_bookings: number;
  created_at: string;
  updated_at: string;
  classes?: {
    name: string;
    description?: string;
    location_id: string;
    min_age?: number;
    max_age?: number;
  };
}

const ClassBooking = () => {
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [formData, setFormData] = useState({
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentZip: '',
    participantName: '',
    participantAge: '',
    participantBirthDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [franchiseeData, setFranchiseeData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchFranchiseeData = async () => {
      if (franchiseeSlug) {
        try {
          const { data, error } = await supabase
            .from('franchisees')
            .select('id')
            .eq('slug', franchiseeSlug)
            .single();

          if (error) {
            console.error('Error fetching franchisee data:', error);
            toast.error('Failed to load franchisee data.');
          } else if (data) {
            setFranchiseeData({ id: data.id });
          }
        } catch (error) {
          console.error('Error fetching franchisee data:', error);
          toast.error('Failed to load franchisee data.');
        }
      }
    };

    fetchFranchiseeData();
  }, [franchiseeSlug]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedDate && franchiseeData) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        try {
          const { data, error } = await supabase
            .from('class_schedules')
            .select(`
              *,
              classes (
                name,
                description,
                location_id,
                min_age,
                max_age
              )
            `)
            .eq('classes.location_id', franchiseeData.id)
            .eq('is_active', true);

          if (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to load classes for the selected date.');
          } else {
            setClasses(data || []);
          }
        } catch (error) {
          console.error('Error fetching classes:', error);
          toast.error('Failed to load classes for the selected date.');
        }
      }
    };

    fetchClasses();
  }, [selectedDate, franchiseeData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !formData.parentFirstName || !formData.parentLastName || 
        !formData.parentEmail || !formData.parentPhone || !formData.parentZip ||
        !formData.participantName || !formData.participantAge) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create lead with proper status
      const bookingSessionData = {
        selected_class: {
          id: selectedClass.id,
          name: selectedClass.classes?.name || '',
          start_time: selectedClass.start_time,
          end_time: selectedClass.end_time
        },
        selected_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        participant_info: {
          name: formData.participantName,
          age: formData.participantAge,
          birth_date: formData.participantBirthDate
        }
      };

      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          franchisee_id: franchiseeData?.id,
          first_name: formData.parentFirstName,
          last_name: formData.parentLastName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
          zip: formData.parentZip,
          status: 'booked_upcoming',
          source: 'landing_page',
          selected_location_id: selectedClass.classes?.location_id,
          booking_session_data: bookingSessionData
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
        toast.error('Failed to create lead. Please try again.');
        return;
      }

      // Create appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          booking_id: leadData.id,
          selected_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
          class_time: `${selectedClass.start_time} - ${selectedClass.end_time}`,
          class_name: selectedClass.classes?.name || '',
          participant_name: formData.participantName,
          participant_age: parseInt(formData.participantAge),
          participant_birth_date: formData.participantBirthDate || null,
          class_schedule_id: selectedClass.id
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        toast.error('Failed to create appointment. Please try again.');
        return;
      }

      toast.success('Booking successful!');
      navigate('/booking-confirmation');
    } catch (error: any) {
      console.error('Error during booking:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Book a Class</CardTitle>
          <CardDescription>
            Select a date and fill in the details to book a class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Select Date</Label>
              <DatePicker
                id="date"
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                placeholderText="Select a date"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="class">Select Class</Label>
              <select
                id="class"
                name="class"
                className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => {
                  const selectedClassId = e.target.value;
                  const foundClass = classes.find(cls => cls.id === selectedClassId);
                  setSelectedClass(foundClass || null);
                }}
                value={selectedClass ? selectedClass.id : ''}
                required
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.classes?.name || 'Class'} - {cls.start_time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="parentFirstName">Parent First Name</Label>
              <Input
                id="parentFirstName"
                name="parentFirstName"
                type="text"
                placeholder="First Name"
                value={formData.parentFirstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentLastName">Parent Last Name</Label>
              <Input
                id="parentLastName"
                name="parentLastName"
                type="text"
                placeholder="Last Name"
                value={formData.parentLastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                name="parentEmail"
                type="email"
                placeholder="Email"
                value={formData.parentEmail}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                placeholder="Phone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentZip">Parent Zip Code</Label>
              <Input
                id="parentZip"
                name="parentZip"
                type="text"
                placeholder="Zip Code"
                value={formData.parentZip}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="participantName">Participant Name</Label>
              <Input
                id="participantName"
                name="participantName"
                type="text"
                placeholder="Participant Name"
                value={formData.participantName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="participantAge">Participant Age</Label>
              <Input
                id="participantAge"
                name="participantAge"
                type="number"
                placeholder="Participant Age"
                value={formData.participantAge}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="participantBirthDate">Participant Birth Date</Label>
              <Input
                id="participantBirthDate"
                name="participantBirthDate"
                type="date"
                placeholder="Participant Birth Date"
                value={formData.participantBirthDate}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Book Class'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassBooking;
