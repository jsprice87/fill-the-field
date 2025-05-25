import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Users, Map, List } from 'lucide-react';
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
  email?: string;
  latitude?: number;
  longitude?: number;
}

const FindClasses: React.FC = () => {
  const { franchiseeId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession, getLeadData, getLeadId } = useBookingSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [franchiseeData, setFranchiseeData] = useState<any>(null);

  const leadData = getLeadData();
  const leadId = getLeadId();

  useEffect(() => {
    loadData();
  }, [franchiseeId, leadId]);

  const loadData = async () => {
    if (!franchiseeId) return;
    
    setIsLoading(true);
    try {
      // Get franchisee by slug
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('*')
        .eq('slug', franchiseeId)
        .single();

      if (franchiseeError || !franchisee) {
        throw new Error('Franchisee not found');
      }

      setFranchiseeData(franchisee);

      // If we have a lead ID but no lead data in session, fetch it
      if (leadId && !leadData) {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (!leadError && lead) {
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

  const handleLocationSelect = async (location: Location) => {
    console.log('Selecting location:', location.id, location.name);
    
    // Update session with selected location
    updateSession({
      selectedLocation: {
        id: location.id,
        name: location.name,
        address: `${location.address}, ${location.city}, ${location.state}`
      }
    });
    
    console.log('Navigating to booking page');
    // Use React Router navigation instead of window.location.href
    navigate(`/${franchiseeId}/free-trial/booking`);
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

  const currentLeadData = leadData || sessionData.leadData;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-3xl mb-2">SOCCER STARS</h1>
          <h2 className="font-agrandir text-xl">Find Classes Near You</h2>
          {currentLeadData && (
            <p className="font-poppins text-sm opacity-90 mt-2">
              Hello {currentLeadData.firstName}, let's find classes near {currentLeadData.zip}
            </p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-agrandir text-2xl text-brand-navy mb-2">Available Locations</h3>
            {franchiseeData && (
              <p className="font-poppins text-gray-600">
                {franchiseeData.company_name} - {locations.length} location{locations.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="font-poppins"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="font-poppins"
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {viewMode === 'map' && (
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-8 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="font-poppins text-gray-600 text-lg">Interactive Map Coming Soon</p>
              <p className="font-poppins text-gray-500 text-sm">
                We're working on adding map functionality to help you visualize location distances
              </p>
            </div>
          </div>
        )}
        
        {/* Locations List */}
        <div className="space-y-4">
          {locations.length > 0 ? (
            locations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-blue">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="font-agrandir text-xl text-brand-navy mb-3">
                        {location.name}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-start text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                          <span className="font-poppins">
                            {location.address}<br />
                            {location.city}, {location.state} {location.zip}
                          </span>
                        </div>
                        {location.phone && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-poppins text-sm">
                              📞 {location.phone}
                            </span>
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-poppins text-sm">
                              ✉️ {location.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-6">
                      <Button
                        onClick={() => handleLocationSelect(location)}
                        className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins px-6 py-3"
                        size="lg"
                      >
                        Select Location
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center border-l-4 border-l-brand-red">
              <div className="mb-6">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-agrandir text-xl text-brand-navy mb-2">
                  No Locations Found Near You
                </h3>
                <p className="font-poppins text-gray-600 mb-6 max-w-md mx-auto">
                  We don't currently have any locations within 50km of your area ({currentLeadData?.zip}).
                  Would you like us to notify you when programs become available in your area?
                </p>
                <Button
                  onClick={handleRequestLocation}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
                  size="lg"
                >
                  Request Programs in My Area
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Navigation hint */}
        {locations.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-poppins text-blue-800 text-center">
              💡 Select a location above to view available classes and book your free trial
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindClasses;
