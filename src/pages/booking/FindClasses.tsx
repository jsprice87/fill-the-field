
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useFranchiseeOptional } from '@/contexts/FranchiseeContext';
import { useLocations } from '@/hooks/useLocations';
import { useClasses } from '@/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const FindClasses: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const flowId = searchParams.get('flow');
  
  const { flowData, loadFlow, updateFlow } = useBookingFlow();
  const franchiseeContext = useFranchiseeOptional();
  const franchiseeId = franchiseeContext?.franchiseeId;
  
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  const { data: locations } = useLocations();
  const { data: classes } = useClasses({ locationId: selectedLocation || undefined });

  useEffect(() => {
    if (flowId && franchiseeId) {
      loadFlow(flowId).then((loadedFlowData) => {
        console.log('lead-info-from-landing', loadedFlowData?.leadData);
      }).catch((error) => {
        console.error('Error loading flow:', error);
        toast.error('Booking session not found');
        navigate(`/${franchiseeSlug}/free-trial`);
      });
    }
  }, [flowId, franchiseeId, loadFlow, navigate, franchiseeSlug]);

  const handleLocationChange = async (locationId: string) => {
    setSelectedLocation(locationId);
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
  };

  const handleContinue = async () => {
    if (!flowId || !selectedLocation || !selectedClass) {
      toast.error('Please select a location and a class.');
      return;
    }

    // Find the selected location data
    const locationData = locations?.find(loc => loc.id === selectedLocation);
    
    await updateFlow({
      selectedLocation: locationData ? {
        id: locationData.id,
        name: locationData.name,
        address: locationData.address
      } : undefined,
      selectedClass: selectedClass
    });

    navigate(`/${franchiseeSlug}/free-trial/booking?flow=${flowId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Find Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Select Location</label>
            <Select onValueChange={handleLocationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Select Class</label>
            <Select onValueChange={handleClassChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleContinue} className="w-full">
            Continue to Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindClasses;
