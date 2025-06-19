
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextInput } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, User, Users, ArrowLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeData';
import { useLocation } from '@/hooks/useLocations';

interface ClassSchedule {
  id: string;
  name: string;
  description: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  minAge: number;
  maxAge: number;
  capacity: number;
  currentBookings: number;
  nextAvailableDate: string;
}

interface QuickFormData {
  childName: string;
  childAge: number;
}

const FindClasses: React.FC = () => {
  const navigate = useNavigate();
  const { franchiseeSlug, locationId } = useParams<{ franchiseeSlug: string; locationId: string }>();
  const [searchParams] = useSearchParams();
  
  const [quickForm, setQuickForm] = useState<QuickFormData>({
    childName: searchParams.get('childName') || '',
    childAge: parseInt(searchParams.get('childAge') || '0') || 5,
  });
  
  const [availableClasses, setAvailableClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: franchisee, isLoading: isFranchiseeLoading } = useFranchiseeBySlug(franchiseeSlug as string);
  const { data: location, isLoading: isLocationLoading } = useLocation(locationId as string);

  useEffect(() => {
    // Mock class data - in real app, fetch from API based on location
    const mockClasses: ClassSchedule[] = [
      {
        id: 'class-1',
        name: 'Lil Kickers',
        description: 'Perfect introduction to soccer for toddlers. Focus on fun, basic skills, and social interaction.',
        dayOfWeek: 'Saturday',
        time: '9:00 AM',
        duration: 45,
        minAge: 2,
        maxAge: 4,
        capacity: 8,
        currentBookings: 5,
        nextAvailableDate: '2024-01-13',
      },
      {
        id: 'class-2',
        name: 'Soccer Skills',
        description: 'Develop fundamental soccer skills through fun games and activities.',
        dayOfWeek: 'Saturday',
        time: '10:00 AM',
        duration: 60,
        minAge: 5,
        maxAge: 8,
        capacity: 12,
        currentBookings: 8,
        nextAvailableDate: '2024-01-13',
      },
      {
        id: 'class-3',
        name: 'Junior Academy',
        description: 'More advanced training for young players ready to take their game to the next level.',
        dayOfWeek: 'Saturday',
        time: '11:30 AM',
        duration: 75,
        minAge: 9,
        maxAge: 12,
        capacity: 15,
        currentBookings: 10,
        nextAvailableDate: '2024-01-13',
      },
    ];
    
    setAvailableClasses(mockClasses);
    setIsLoading(false);
  }, [locationId]);

  const handleQuickFormChange = (field: keyof QuickFormData, value: string | number) => {
    setQuickForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookClass = (classSchedule: ClassSchedule) => {
    if (!quickForm.childName.trim()) {
      toast.error('Please enter child\'s name first');
      return;
    }

    if (quickForm.childAge < classSchedule.minAge || quickForm.childAge > classSchedule.maxAge) {
      toast.error(`This class is for ages ${classSchedule.minAge}-${classSchedule.maxAge}. Please select a different class or update the age.`);
      return;
    }

    if (classSchedule.currentBookings >= classSchedule.capacity) {
      toast.error('This class is currently full. Please try another class or check back later.');
      return;
    }

    // Navigate to booking form with pre-filled data
    const bookingParams = new URLSearchParams({
      childName: quickForm.childName,
      childAge: quickForm.childAge.toString(),
    });

    navigate(`/booking/${franchiseeSlug}/location/${locationId}/class/${classSchedule.id}?${bookingParams.toString()}`);
  };

  const handleBack = () => {
    navigate(`/booking/${franchiseeSlug}`);
  };

  const getAgeAppropriateClasses = () => {
    if (!quickForm.childAge) return availableClasses;
    
    return availableClasses.filter(cls => 
      quickForm.childAge >= cls.minAge && quickForm.childAge <= cls.maxAge
    );
  };

  const getSpotsRemaining = (classSchedule: ClassSchedule) => {
    return classSchedule.capacity - classSchedule.currentBookings;
  };

  if (isFranchiseeLoading || isLocationLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h1>
          <p className="text-gray-600 mb-4">The requested location could not be found.</p>
          <Button onClick={() => navigate(`/booking/${franchiseeSlug}`)}>
            Back to Locations
          </Button>
        </div>
      </div>
    );
  }

  const ageAppropriateClasses = getAgeAppropriateClasses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-blue">
            {franchisee?.company_name || 'Soccer Academy'}
          </h1>
          <Button variant="subtle" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Classes
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Find the perfect soccer class for your child at {location.name}
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            {location.address}, {location.city}, {location.state} {location.zip}
          </p>
        </div>

        {/* Quick Info Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Quick Info (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="childName">Child's Name</Label>
                <TextInput
                  id="childName"
                  type="text"
                  placeholder="Enter child's name"
                  value={quickForm.childName}
                  onChange={(e) => handleQuickFormChange('childName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="childAge">Child's Age</Label>
                <TextInput
                  id="childAge"
                  type="number"
                  placeholder="Age"
                  min="2"
                  max="18"
                  value={quickForm.childAge.toString()}
                  onChange={(e) => handleQuickFormChange('childAge', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            {quickForm.childAge > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                Showing classes appropriate for age {quickForm.childAge}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Available Classes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {ageAppropriateClasses.length > 0 ? 'Available Classes' : 'All Classes'}
          </h2>
          
          {ageAppropriateClasses.length === 0 && quickForm.childAge > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">No Age-Appropriate Classes Found</h3>
              <p className="text-sm text-yellow-700">
                We don't currently have classes for age {quickForm.childAge} at this location. 
                Please check our other locations or contact us for more information.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(ageAppropriateClasses.length > 0 ? ageAppropriateClasses : availableClasses).map((classSchedule) => {
              const spotsRemaining = getSpotsRemaining(classSchedule);
              const isAgeAppropriate = !quickForm.childAge || 
                (quickForm.childAge >= classSchedule.minAge && quickForm.childAge <= classSchedule.maxAge);
              
              return (
                <Card 
                  key={classSchedule.id} 
                  className={`h-full ${!isAgeAppropriate ? 'opacity-60' : ''}`}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{classSchedule.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Ages {classSchedule.minAge}-{classSchedule.maxAge}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm">
                      {classSchedule.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{classSchedule.dayOfWeek}s</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{classSchedule.time} ({classSchedule.duration} mins)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>
                          {spotsRemaining > 0 ? (
                            <span className="text-green-600">
                              {spotsRemaining} spots available
                            </span>
                          ) : (
                            <span className="text-red-600">Class full</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Next class:</strong> {classSchedule.nextAvailableDate}
                      </p>
                    </div>

                    {!isAgeAppropriate && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-xs text-yellow-700">
                          Not age-appropriate for {quickForm.childAge} year old
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleBookClass(classSchedule)}
                      disabled={spotsRemaining <= 0}
                      className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                      variant={spotsRemaining <= 0 ? 'outline' : 'filled'}
                    >
                      {spotsRemaining <= 0 ? (
                        'Class Full'
                      ) : (
                        <>
                          Book Free Trial
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {availableClasses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Classes Available
            </h3>
            <p className="text-gray-600 mb-4">
              There are currently no classes scheduled at this location.
            </p>
            <Button onClick={handleBack}>
              Try Another Location
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FindClasses;
