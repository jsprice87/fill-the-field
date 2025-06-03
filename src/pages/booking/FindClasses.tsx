
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Users, Map, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// Lazy load the map component for better performance
const InteractiveMap = lazy(() => import('@/components/maps/InteractiveMap'));

interface BookingLocation {
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
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow');
  
  const { flowData, loadFlow, updateFlow, isLoading: flowLoading } = useBookingFlow(flowId || undefined, franchiseeSlug);
  const [locations, setLocations] = useState<BookingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  const [flowLoaded, setFlowLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug logging
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔍 FIND CLASSES DEBUG [${timestamp}]: ${message}`);
    setDebugInfo(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addDebugLog('FindClasses component mounted');
    addDebugLog(`Parameters: franchiseeSlug=${franchiseeSlug}, flowId=${flowId}`);
    
    if (!flowId) {
      addDebugLog('No flow ID found, redirecting to landing');
      navigate(`/${franchiseeSlug}/free-trial`);
      return;
    }

    loadData();
  }, [franchiseeSlug, flowId]);

  const loadData = async () => {
    if (!franchiseeSlug || !flowId) {
      addDebugLog('Missing required parameters');
      setError('Missing required parameters');
      setIsLoading(false);
      return;
    }
    
    addDebugLog('Starting data load process');
    setIsLoading(true);
    setError('');
    
    try {
      // Load flow data first
      addDebugLog('Loading flow data...');
      await loadFlow(flowId);
      setFlowLoaded(true);
      addDebugLog('Flow data loaded successfully');

      // Get franchisee by slug
      addDebugLog(`Loading franchisee data for slug: ${franchiseeSlug}`);
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('*')
        .eq('slug', franchiseeSlug)
        .single();

      if (franchiseeError || !franchisee) {
        addDebugLog(`Franchisee error: ${franchiseeError?.message || 'Not found'}`);
        throw new Error('Franchisee not found');
      }

      addDebugLog(`Franchisee loaded: ${franchisee.company_name} (ID: ${franchisee.id})`);
      setFranchiseeData(franchisee);

      // Load locations for this franchisee
      addDebugLog('Loading locations...');
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchisee.id)
        .eq('is_active', true)
        .order('name');

      if (locationsError) {
        addDebugLog(`Locations error: ${locationsError.message}`);
        throw locationsError;
      }

      addDebugLog(`Raw locations data: ${JSON.stringify(locationsData)}`);
      
      // Convert database locations to BookingLocation format with validation
      const convertedLocations: BookingLocation[] = (locationsData || [])
        .filter(loc => {
          const isValid = loc && loc.id && loc.name && loc.address && loc.city && loc.state && loc.zip;
          if (!isValid) {
            addDebugLog(`Filtering out invalid location: ${JSON.stringify(loc)}`);
          }
          return isValid;
        })
        .map(loc => {
          const converted = {
            id: loc.id,
            name: loc.name,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            zip: loc.zip,
            phone: loc.phone,
            email: loc.email,
            latitude: loc.latitude ? parseFloat(loc.latitude.toString()) : undefined,
            longitude: loc.longitude ? parseFloat(loc.longitude.toString()) : undefined
          };
          
          addDebugLog(`Converted location: ${converted.name} - lat: ${converted.latitude}, lng: ${converted.longitude}`);
          return converted;
        })
        .filter(loc => {
          // Additional validation for converted locations
          const isValid = typeof loc.id === 'string' && 
            typeof loc.name === 'string' && 
            typeof loc.address === 'string';
          
          if (!isValid) {
            addDebugLog(`Filtering out invalid converted location: ${JSON.stringify(loc)}`);
          }
          return isValid;
        });
      
      addDebugLog(`Final converted locations: ${convertedLocations.length} locations`);
      addDebugLog(`Locations with coordinates: ${convertedLocations.filter(l => l.latitude && l.longitude).length}`);
      
      setLocations(convertedLocations);
    } catch (error) {
      addDebugLog(`Error during data load: ${error}`);
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      toast.error('Failed to load locations');
      // If flow loading fails, redirect to start over
      navigate(`/${franchiseeSlug}/free-trial`);
    } finally {
      setIsLoading(false);
      addDebugLog('Data load process completed');
    }
  };

  const handleLocationSelect = async (location: BookingLocation) => {
    addDebugLog(`Location selected: ${location.name} (ID: ${location.id})`);
    
    if (!flowId) {
      addDebugLog('No flow ID available for location selection');
      toast.error('Session expired. Please start over.');
      return;
    }

    if (!location || !location.id || !location.name) {
      addDebugLog(`Invalid location data: ${JSON.stringify(location)}`);
      toast.error('Invalid location data. Please try again.');
      return;
    }
    
    try {
      // Update flow with selected location
      await updateFlow({
        selectedLocation: {
          id: location.id,
          name: location.name,
          address: `${location.address}, ${location.city}, ${location.state}`
        }
      });
      
      addDebugLog('Location updated in flow, navigating to booking page');
      navigate(`/${franchiseeSlug}/free-trial/classes?flow=${flowId}`);
    } catch (error) {
      addDebugLog(`Error updating flow: ${error}`);
      console.error('Error updating flow:', error);
      toast.error('Failed to select location. Please try again.');
    }
  };

  const handleRequestLocation = () => {
    // TODO: Implement location request modal
    toast.info('Location request feature coming soon');
  };

  const handleMapError = () => {
    addDebugLog('Map failed, switching to list view');
    setViewMode('list');
    toast.info('Map is unavailable, showing list view');
  };

  // Show loading state while data is being loaded
  if (isLoading || flowLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600">Loading locations...</p>
          <div className="mt-4 text-xs text-gray-500 max-w-md">
            <div className="font-semibold">Debug Info:</div>
            {debugInfo.slice(-3).map((info, i) => <div key={i}>{info}</div>)}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="font-agrandir text-2xl text-brand-navy mb-4">Unable to Load Locations</h2>
          <p className="font-poppins text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate(`/${franchiseeSlug}/free-trial`)}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
          >
            Start Over
          </Button>
          <div className="mt-4 text-xs text-gray-500 text-left">
            <div className="font-semibold">Debug Info:</div>
            {debugInfo.map((info, i) => <div key={i}>{info}</div>)}
          </div>
        </div>
      </div>
    );
  }

  const currentLeadData = flowData?.leadData;

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

        {/* Debug panel */}
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs border">
          <div className="font-semibold mb-2">🔍 Debug Information:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <strong>Locations loaded:</strong> {locations.length}<br />
              <strong>With coordinates:</strong> {locations.filter(l => l.latitude && l.longitude).length}<br />
              <strong>View mode:</strong> {viewMode}
            </div>
            <div className="text-xs">
              <strong>Recent logs:</strong>
              {debugInfo.slice(-3).map((info, i) => <div key={i}>{info}</div>)}
            </div>
          </div>
        </div>

        {/* Responsive layout: Desktop side-by-side, Mobile stacked */}
        <div className={`${viewMode === 'map' ? 'lg:grid lg:grid-cols-3 lg:gap-8' : ''}`}>
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="lg:col-span-2 mb-8 lg:mb-0">
              <div className="h-[300px] lg:h-[600px]">
                <ErrorBoundary 
                  fallback={
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <p className="font-poppins text-gray-600 mb-4">Map is unavailable</p>
                        <Button 
                          onClick={() => setViewMode('list')}
                          variant="outline"
                          size="sm"
                        >
                          View List Instead
                        </Button>
                      </div>
                    </div>
                  }
                  onReset={handleMapError}
                >
                  <Suspense fallback={
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy mx-auto mb-2"></div>
                        <p className="font-poppins text-gray-600 text-sm">Loading map...</p>
                      </div>
                    </div>
                  }>
                    <InteractiveMap
                      locations={locations}
                      franchiseeSlug={franchiseeSlug || ''}
                      flowId={flowId || undefined}
                      onLocationSelect={handleLocationSelect}
                      className="h-full"
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          )}
          
          {/* Locations List */}
          <div className={`space-y-4 ${viewMode === 'map' ? 'lg:col-span-1' : ''}`}>
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
                              {location.latitude && location.longitude && (
                                <span className="text-xs text-green-600 block">
                                  ✓ Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                </span>
                              )}
                              {(!location.latitude || !location.longitude) && (
                                <span className="text-xs text-red-600 block">
                                  ⚠ No coordinates
                                </span>
                              )}
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
