import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Users, Clock, Star, ArrowRight, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@mantine/core';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeBySlug';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import { useActiveClassSchedules } from '@/hooks/useActiveClassSchedules';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { LeadGenerationProvider } from '@/components/booking/LeadGenerationProvider';
import LeadCaptureForm from '@/components/booking/LeadCaptureForm';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';

interface BookingLandingProps {
  franchiseeId?: string;
}

const BookingLanding: React.FC<BookingLandingProps> = ({ franchiseeId: propFranchiseeId }) => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  // Fetch franchisee details
  const { data: franchisee, isLoading: isFranchiseeLoading, isError: isFranchiseeError } = useFranchiseeBySlug(franchiseeSlug);

  // Fetch franchisee settings
  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError } = useFranchiseeSettings();

  // Fetch active class schedules
  const { data: classSchedules, isLoading: isClassesLoading, isError: isClassesError } = useActiveClassSchedules();

  const isLoading = isFranchiseeLoading || isSettingsLoading || isClassesLoading;
  const isError = isFranchiseeError || isSettingsError || isClassesError;

  const handleClassSelect = (classScheduleId: string) => {
    if (settings?.require_lead_capture) {
      setShowLeadCapture(true);
    } else {
      // If lead capture is not required, navigate directly to the class booking page
      navigate(`/${franchiseeSlug}/booking/class/${classScheduleId}`);
    }
  };

  const handleLeadCaptureComplete = (classScheduleId: string) => {
    // After successful lead capture, navigate to the class booking page
    navigate(`/${franchiseeSlug}/booking/class/${classScheduleId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !franchisee) {
    return (
      <ErrorBoundary>
        <p>Failed to load booking page.</p>
      </ErrorBoundary>
    );
  }

  return (
    <MetaPixelProvider franchiseeId={franchisee.id}>
      <LeadGenerationProvider>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            {showLeadCapture ? (
              <LeadCaptureForm
                onLeadCaptureComplete={handleLeadCaptureComplete}
                onClose={() => setShowLeadCapture(false)}
              />
            ) : (
              <Card>
                <CardHeader className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{franchisee.business_name}</CardTitle>
                    {settings?.show_star_rating && (
                      <Badge variant="secondary">
                        <Star className="h-4 w-4 mr-1" />
                        4.5
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {settings?.booking_page_description || 'Find a class and book your free trial!'}
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {classSchedules && classSchedules.length > 0 ? (
                    <div className="space-y-4">
                      {classSchedules.map((schedule) => (
                        <div key={schedule.id} className="border rounded-lg">
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <h3 className="text-lg font-semibold">{schedule.classes.class_name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{schedule.classes.locations.name}, {schedule.classes.locations.city}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(schedule.date_start || '').toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{schedule.start_time} - {schedule.end_time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{schedule.classes.max_capacity} spots available</span>
                              </div>
                            </div>
                            <Button onClick={() => handleClassSelect(schedule.id)} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins">
                              Select Class
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{schedule.classes.locations.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{schedule.classes.locations.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-gray-600">No classes available at this time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </LeadGenerationProvider>
    </MetaPixelProvider>
  );
};

export default BookingLanding;
