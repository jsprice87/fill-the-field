
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingSession } from '@/hooks/useBookingSession';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

const FindClasses: React.FC = () => {
  const { franchiseeId } = useParams();
  const { sessionData, updateSession } = useBookingSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [leadData, setLeadData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    loadData();
  }, [franchiseeId, sessionData.leadId]);

  const loadData = async () => {
    if (!franchiseeId) return;
    
    setIsLoading(true);
    try {
      // Get franchisee by slug
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('id')
        .eq('slug', franchiseeId)
        .single();

      if (franchiseeError || !franchisee) {
        throw new Error('Franchisee not found');
      }

      // Load lead data if we have a lead ID
      if (sessionData.leadId) {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', sessionData.leadId)
          .single();

        if (!leadError && lead) {
          setLeadData(lead);
          updateSession({
            leadData: {
              firstName: lead.first_name,
              lastName: lead.last_name,
              email: lead.email,
              phone: lead.phone,
              zip: lead.zip
            }
          });
        }
      }

      // Load locations for this franchisee
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchisee.id)
        .eq('is_active', true)
        .order('name');

      if (locationsError) {
        throw locationsError;
      }

      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    updateSession({
      selectedLocation: {
        id: location.id,
        name: location.name,
        address: `${location.address}, ${location.city}, ${location.state}`
      }
    });
    
    // Navigate to class booking
    window.location.href = `/${franchiseeId}/free-trial/booking`;
  };

  const handleRequestLocation = () => {
    // TODO: Implement location request modal
    toast.info('Location request feature coming soon');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - FIND CLASSES</h1>
          {leadData && (
            <p className="font-poppins text-sm opacity-90">
              Hello {leadData.first_name}, let's find classes near {leadData.zip}
            </p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-agrandir text-3xl text-brand-navy">Find Classes Near You</h2>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="font-poppins"
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="font-poppins"
            >
              Map View
            </Button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center mb-8">
            <p className="font-poppins text-gray-600">Interactive Map Coming Soon</p>
          </div>
        ) : null}
        
        {/* Locations List */}
        <div className="space-y-4">
          {locations.length > 0 ? (
            locations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-agrandir text-xl text-brand-navy">
                        {location.name}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 mt-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-poppins">
                          {location.address}, {location.city}, {location.state} {location.zip}
                        </span>
                      </div>
                      {location.phone && (
                        <p className="font-poppins text-sm text-gray-600 mt-1">
                          📞 {location.phone}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLocationSelect(location)}
                      className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins"
                    >
                      Select Location
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="mb-6">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-agrandir text-xl text-brand-navy mb-2">
                  No Locations Found
                </h3>
                <p className="font-poppins text-gray-600 mb-6">
                  We don't currently have any locations within 50km of your area.
                  Would you like us to notify you when programs become available?
                </p>
                <Button
                  onClick={handleRequestLocation}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
                >
                  Request Programs in My Area
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindClasses;
