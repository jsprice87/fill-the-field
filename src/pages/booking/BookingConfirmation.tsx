import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, MapPin, Users, Share, ArrowLeft, ExternalLink, CalendarPlus } from 'lucide-react';
import { Facebook, Instagram } from 'lucide-react';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateCalendarUrls, downloadICSFile } from '@/utils/calendarUtils';
import { formatDateInTimezone, DEFAULT_TIMEZONE } from '@/utils/timezoneUtils';

interface BookingData {
  id: string;
  booking_reference: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  created_at: string;
  appointments: Array<{
    id: string;
    participant_name: string;
    participant_age: number;
    class_name: string;
    class_time: string;
    selected_date?: string;
    health_conditions?: string;
    age_override?: boolean;
  }>;
  location: {
    name: string;
    address: string;
  };
}

interface FranchiseeData {
  company_name: string;
}

const BookingConfirmation: React.FC = () => {
  const { franchiseeId, bookingId } = useParams();
  const navigate = useNavigate();
  const { data: settings } = useFranchiseeSettings();
  const { data: franchiseeData } = useFranchiseeData();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [franchiseeInfo, setFranchiseeInfo] = useState<FranchiseeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get timezone from settings or use default
  const timezone = settings?.timezone || DEFAULT_TIMEZONE;

  useEffect(() => {
    if (!bookingId) {
      navigate(`/${franchiseeId}/free-trial`);
      return;
    }

    loadBookingData();
  }, [bookingId, franchiseeId, navigate]);

  const loadBookingData = async () => {
    try {
      // Get franchisee data first
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('company_name')
        .eq('slug', franchiseeId)
        .single();

      if (franchiseeError) {
        console.error('Error loading franchisee:', franchiseeError);
      } else {
        setFranchiseeInfo(franchisee);
      }

      // Fetch booking with appointments and location data
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          appointments(*),
          class_schedules!inner(
            classes!inner(
              location_id,
              locations!inner(name, address)
            )
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        console.error('Error loading booking:', bookingError);
        toast.error('Failed to load booking details');
        navigate(`/${franchiseeId}/free-trial`);
        return;
      }

      // Transform the data to match our interface
      const transformedBooking: BookingData = {
        id: bookingData.id,
        booking_reference: bookingData.booking_reference,
        parent_first_name: bookingData.parent_first_name,
        parent_last_name: bookingData.parent_last_name,
        parent_email: bookingData.parent_email,
        parent_phone: bookingData.parent_phone,
        created_at: bookingData.created_at,
        appointments: bookingData.appointments || [],
        location: {
          name: bookingData.class_schedules?.classes?.locations?.name || 'Location',
          address: bookingData.class_schedules?.classes?.locations?.address || ''
        }
      };

      setBooking(transformedBooking);
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking details');
      navigate(`/${franchiseeId}/free-trial`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const businessName = franchiseeInfo?.company_name || franchiseeData?.company_name || 'Soccer Stars';
    
    // Use custom share message template from settings if available
    let shareText = settings?.share_message_template || 
      `I just signed up my child for a free soccer trial at {company_name}! Check it out: {url}`;
    
    // Replace placeholders
    shareText = shareText
      .replace(/{company_name}/g, businessName)
      .replace(/{url}/g, `${window.location.origin}/${franchiseeId}/free-trial`);
    
    if (navigator.share) {
      navigator.share({
        title: `${businessName} Free Trial`,
        text: shareText,
        url: `${window.location.origin}/${franchiseeId}/free-trial`
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Share message copied to clipboard!');
    }
  };

  const handleAddToCalendar = (appointment: any) => {
    if (!appointment.selected_date) return;

    // Parse the class time to get start and end times
    const timeMatch = appointment.class_time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    if (!timeMatch) return;

    const [, startTimeStr, endTimeStr] = timeMatch;
    const appointmentDate = new Date(appointment.selected_date);
    
    // Create start and end Date objects
    const startTime = parseTimeString(startTimeStr, appointmentDate);
    const endTime = parseTimeString(endTimeStr, appointmentDate);

    const calendarEvent = {
      title: `${appointment.class_name} - ${appointment.participant_name}`,
      description: `Soccer class for ${appointment.participant_name} (${appointment.participant_age} years old)${appointment.health_conditions ? `\nSpecial notes: ${appointment.health_conditions}` : ''}`,
      start: startTime,
      end: endTime,
      location: `${booking?.location.name}, ${booking?.location.address}`,
      timezone: timezone
    };

    const urls = generateCalendarUrls(calendarEvent);
    
    // For now, let's offer Google Calendar and download ICS
    const choice = confirm('Add to Google Calendar? (Cancel to download calendar file instead)');
    if (choice) {
      window.open(urls.google, '_blank');
    } else {
      downloadICSFile(calendarEvent);
    }
  };

  const parseTimeString = (timeStr: string, date: Date) => {
    const [time, period] = timeStr.split(/\s*(AM|PM)/i);
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    const result = new Date(date);
    result.setHours(hour24, minutes, 0, 0);
    return result;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    
    // Use timezone-aware formatting
    return formatDateInTimezone(dateStr, timezone, 'EEEE, MMMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-agrandir text-2xl text-brand-navy mb-4">Booking Not Found</h2>
          <p className="font-poppins text-gray-600 mb-6">We couldn't find the booking you're looking for.</p>
          <Button asChild className="bg-brand-navy hover:bg-brand-navy/90 text-white font-poppins">
            <Link to={`/${franchiseeId}/free-trial`}>Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Group appointments by class
  const appointmentsByClass = booking.appointments.reduce((acc, appointment) => {
    const key = `${appointment.class_name}-${appointment.class_time}`;
    if (!acc[key]) {
      acc[key] = {
        className: appointment.class_name,
        classTime: appointment.class_time,
        appointments: []
      };
    }
    acc[key].appointments.push(appointment);
    return acc;
  }, {} as Record<string, { className: string; classTime: string; appointments: any[] }>);

  const businessName = franchiseeInfo?.company_name || franchiseeData?.company_name || 'Soccer Stars';
  const websiteUrl = settings?.website_url;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">
            {businessName.toUpperCase()} - BOOKING CONFIRMED
          </h1>
          {booking.booking_reference && (
            <p className="font-poppins text-sm opacity-90">Booking Reference: {booking.booking_reference}</p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="font-agrandir text-4xl text-brand-navy mb-4">Booking Confirmed!</h2>
            <p className="font-poppins text-lg text-gray-600 mb-4">
              Your free trial class has been booked. We're excited to see you on the field!
            </p>
          </div>

          {/* Booking Summary */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-red mt-1" />
                <div>
                  <h4 className="font-poppins font-semibold text-brand-navy">{booking.location.name}</h4>
                  <p className="font-poppins text-gray-600">{booking.location.address}</p>
                </div>
              </div>

              {/* Classes and Appointments */}
              {Object.values(appointmentsByClass).map((classGroup, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-brand-blue" />
                    <h4 className="font-agrandir text-lg text-brand-navy">{classGroup.className}</h4>
                  </div>
                  <p className="font-poppins text-gray-600 mb-3">{classGroup.classTime}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-brand-red" />
                    <span className="font-poppins font-medium">Participants:</span>
                  </div>
                  <ul className="space-y-3">
                    {classGroup.appointments.map((appointment) => (
                      <li key={appointment.id} className="font-poppins text-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            • {appointment.participant_name} ({appointment.participant_age} years old)
                            {appointment.selected_date && (
                              <div className="ml-4 text-sm text-brand-blue font-medium">
                                📅 {formatDate(appointment.selected_date)}
                              </div>
                            )}
                            {appointment.age_override && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Age Override
                              </span>
                            )}
                          </div>
                          {appointment.selected_date && (
                            <Button
                              onClick={() => handleAddToCalendar(appointment)}
                              size="sm"
                              variant="outline"
                              className="ml-4 text-xs"
                            >
                              <CalendarPlus className="h-3 w-3 mr-1" />
                              Add to Calendar
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Parent/Guardian Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-poppins font-semibold text-brand-navy mb-2">Parent/Guardian Contact:</h4>
                <p className="font-poppins text-gray-700">
                  {booking.parent_first_name} {booking.parent_last_name}
                </p>
                <p className="font-poppins text-gray-600">{booking.parent_email}</p>
                <p className="font-poppins text-gray-600">{booking.parent_phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Share with Friends */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <Share className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                <h4 className="font-agrandir text-lg text-brand-navy mb-2">Share with Friends</h4>
                <p className="font-poppins text-gray-600 text-sm mb-4">
                  Know other families who might enjoy soccer? Share your experience!
                </p>
                <Button 
                  onClick={handleShare}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
                >
                  Share Now
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center gap-2 mb-3">
                  <Facebook className="h-8 w-8 text-blue-600" />
                  <Instagram className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="font-agrandir text-lg text-brand-navy mb-2">Follow Us</h4>
                <p className="font-poppins text-gray-600 text-sm mb-4">
                  Stay connected for updates, tips, and soccer fun!
                </p>
                <div className="space-y-2">
                  {settings?.facebook_url && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </a>
                    </Button>
                  )}
                  {settings?.instagram_url && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learn More */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <ExternalLink className="h-8 w-8 text-brand-red mx-auto mb-3" />
                <h4 className="font-agrandir text-lg text-brand-navy mb-2">Learn More</h4>
                <p className="font-poppins text-gray-600 text-sm mb-4">
                  Discover our full program offerings and philosophy
                </p>
                {websiteUrl ? (
                  <Button asChild className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins">
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                ) : (
                  <Button className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild className="font-poppins">
              <Link to={`/${franchiseeId}/free-trial/find-classes`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Register More Children
              </Link>
            </Button>
            <Button asChild className="bg-brand-navy hover:bg-brand-navy/90 text-white font-poppins">
              <Link to={`/${franchiseeId}/free-trial`}>
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
