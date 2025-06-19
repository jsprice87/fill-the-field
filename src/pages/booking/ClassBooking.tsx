
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextInput } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeData';
import { useLocation } from '@/hooks/useLocations';

interface FormData {
  childName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childAge: number;
}

interface ClassData {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  currentBookings: number;
}

const ClassBooking: React.FC = () => {
  const navigate = useNavigate();
  const { franchiseeSlug, locationId, classId } = useParams<{ 
    franchiseeSlug: string; 
    locationId: string; 
    classId: string; 
  }>();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState<FormData>({
    childName: searchParams.get('childName') || '',
    parentName: searchParams.get('parentName') || '',
    parentEmail: searchParams.get('parentEmail') || '',
    parentPhone: searchParams.get('parentPhone') || '',
    childAge: parseInt(searchParams.get('childAge') || '0') || 5,
  });
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: franchisee, isLoading: isFranchiseeLoading } = useFranchiseeBySlug(franchiseeSlug as string);
  const { data: location, isLoading: isLocationLoading } = useLocation(locationId as string);

  useEffect(() => {
    // Mock class data - in real app, fetch from API
    const mockClassData: ClassData = {
      id: classId || '',
      name: 'Soccer Skills Training',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 60,
      capacity: 12,
      currentBookings: 8,
    };
    
    setClassData(mockClassData);
    setIsLoading(false);
  }, [classId]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.childName.trim()) {
      toast.error('Child\'s name is required');
      return false;
    }
    if (!formData.parentName.trim()) {
      toast.error('Parent/Guardian name is required');
      return false;
    }
    if (!formData.parentEmail.trim()) {
      toast.error('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.parentPhone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (formData.childAge < 3 || formData.childAge > 18) {
      toast.error('Child age must be between 3 and 18');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !classData || !location) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Navigate to confirmation page with all data
      const confirmationParams = new URLSearchParams({
        childName: formData.childName,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        childAge: formData.childAge.toString(),
        locationName: location.name,
        locationId: location.id,
        className: classData.name,
        classDate: classData.date,
        classTime: classData.time,
        classId: classData.id,
        scheduleId: 'schedule-123', // This would come from the actual class schedule
      });

      navigate(`/booking/${franchiseeSlug}/confirm?${confirmationParams.toString()}`);

    } catch (error) {
      console.error('Error processing booking:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/booking/${franchiseeSlug}/location/${locationId}`);
  };

  if (isFranchiseeLoading || isLocationLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData || !location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Not Found</h1>
          <p className="text-gray-600 mb-4">The requested class could not be found.</p>
          <Button onClick={() => navigate(`/booking/${franchiseeSlug}`)}>
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const spotsRemaining = classData.capacity - classData.currentBookings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-blue">
            {franchisee?.company_name || 'Soccer Academy'}
          </h1>
          <Button variant="subtle" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Free Trial Class
          </h1>
          <p className="text-lg text-gray-600">
            Complete the form below to secure your spot in this popular class.
          </p>
        </div>

        {/* Class Information Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Class Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Class</label>
                <p className="text-lg font-semibold text-gray-900">{classData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date & Time</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  {classData.date} at {classData.time}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  {location.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Availability</label>
                <p className="text-lg font-semibold text-green-600">
                  {spotsRemaining} spots remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Registration Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName">Child's Name *</Label>
                  <TextInput
                    id="childName"
                    type="text"
                    placeholder="Enter child's name"
                    value={formData.childName}
                    onChange={(e) => handleInputChange('childName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childAge">Child's Age *</Label>
                  <TextInput
                    id="childAge"
                    type="number"
                    placeholder="Age"
                    min="3"
                    max="18"
                    value={formData.childAge.toString()}
                    onChange={(e) => handleInputChange('childAge', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <TextInput
                  id="parentName"
                  type="text"
                  placeholder="Enter parent/guardian name"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentEmail">Email Address *</Label>
                  <TextInput
                    id="parentEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.parentEmail}
                    onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Phone Number *</Label>
                  <TextInput
                    id="parentPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.parentPhone}
                    onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Free Trial Class</h4>
                <p className="text-sm text-yellow-700">
                  This is a complimentary trial class. No payment is required. Come and see if our program is right for your child!
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || spotsRemaining <= 0}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : spotsRemaining <= 0 ? (
                  'Class Full'
                ) : (
                  <>
                    Continue to Confirmation
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClassBooking;
