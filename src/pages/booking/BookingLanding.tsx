
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@mantine/core';
import { Button } from '@mantine/core';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Clock, Star, ArrowRight, Phone, Mail, Globe } from 'lucide-react';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeBySlug';
import { useClassSchedules } from '@/hooks/useClassSchedules';

const BookingLanding: React.FC = () => {
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const { data: franchisee, isLoading: isFranchiseeLoading, error: franchiseeError } = useFranchiseeBySlug(franchiseeSlug || '');
  const { data: classSchedules = [], isLoading: isClassSchedulesLoading, error: classSchedulesError } = useClassSchedules(franchisee?.id || '');

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    if (classSchedules.length > 0 && !selectedClassId) {
      setSelectedClassId(classSchedules[0].id);
    }
  }, [classSchedules, selectedClassId]);

  // Loading state
  if (isFranchiseeLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
        <p className="font-poppins text-gray-600 mt-2">Loading franchisee information...</p>
      </div>
    );
  }

  // Error states
  if (franchiseeError) {
    return (
      <div className="text-center py-20">
        <p className="font-poppins text-red-600">Error loading franchisee: {franchiseeError.message}</p>
      </div>
    );
  }

  if (!franchisee) {
    return (
      <div className="text-center py-20">
        <p className="font-poppins text-red-600">Franchisee not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="font-agrandir text-4xl text-brand-navy mb-2">{franchisee.company_name}</h1>
        <p className="font-poppins text-gray-600">{franchisee.tagline || 'Welcome to our soccer classes!'}</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <Card.Section className="p-6">
            <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-agrandir text-xl text-brand-navy mb-3">Fun & Engaging</h3>
            <p className="font-poppins text-gray-600">
              Age-appropriate activities that make learning soccer fundamentals enjoyable for every child.
            </p>
          </Card.Section>
        </Card>

        <Card className="text-center">
          <Card.Section className="p-6">
            <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-agrandir text-xl text-brand-navy mb-3">Expert Coaches</h3>
            <p className="font-poppins text-gray-600">
              Trained instructors who specialize in child development and soccer skills.
            </p>
          </Card.Section>
        </Card>

        <Card className="text-center">
          <Card.Section className="p-6">
            <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-agrandir text-xl text-brand-navy mb-3">Flexible Scheduling</h3>
            <p className="font-poppins text-gray-600">
              Multiple class times and locations to fit your family's busy schedule.
            </p>
          </Card.Section>
        </Card>
      </div>

      {/* Classes Section */}
      <div id="classes" className="mb-16">
        <h2 className="font-agrandir text-3xl text-brand-navy text-center mb-8">Available Classes</h2>
        
        {isClassSchedulesLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
            <p className="font-poppins text-gray-600 mt-2">Loading classes...</p>
          </div>
        ) : classSchedulesError ? (
          <Card className="text-center p-8">
            <Card.Section>
              <p className="font-poppins text-red-600">Error loading classes: {classSchedulesError.message}</p>
            </Card.Section>
          </Card>
        ) : classSchedules.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classSchedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <Card.Section className="p-6">
                  <h3 className="font-agrandir text-xl text-brand-navy mb-2">{schedule.classes.name}</h3>
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-poppins text-sm text-gray-600">
                      {schedule.date_start ? new Date(schedule.date_start).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-poppins text-sm text-gray-600">
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-poppins text-sm text-gray-600">
                      {schedule.classes.locations.name}, {schedule.classes.locations.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-poppins text-sm text-gray-600">
                      Capacity: {schedule.classes.max_capacity}
                    </span>
                  </div>
                  <Button
                    fullWidth
                    variant={selectedClassId === schedule.id ? 'filled' : 'outline'}
                    onClick={() => setSelectedClassId(schedule.id)}
                    rightSection={<ArrowRight />}
                  >
                    {selectedClassId === schedule.id ? 'Selected' : 'Select Class'}
                  </Button>
                </Card.Section>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <Card.Section>
              <p className="font-poppins text-gray-600">No classes are currently available. Please check back soon!</p>
            </Card.Section>
          </Card>
        )}
      </div>

      {/* Contact Section */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-agrandir text-3xl text-brand-navy mb-6">Get in Touch</h2>
        <p className="font-poppins text-gray-600 mb-6">
          Have questions? Contact us to learn more about our programs and schedule.
        </p>
        <div className="flex justify-center gap-6">
          {franchisee.phone && (
            <a href={`tel:${franchisee.phone}`} className="flex items-center gap-2 text-brand-blue hover:underline">
              <Phone className="h-5 w-5" />
              {franchisee.phone}
            </a>
          )}
          {franchisee.email && (
            <a href={`mailto:${franchisee.email}`} className="flex items-center gap-2 text-brand-blue hover:underline">
              <Mail className="h-5 w-5" />
              {franchisee.email}
            </a>
          )}
          {franchisee.website_url && (
            <a href={franchisee.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-blue hover:underline">
              <Globe className="h-5 w-5" />
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingLanding;
