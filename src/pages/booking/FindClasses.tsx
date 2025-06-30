import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, Title, Loader, Badge } from '@mantine/core';
import { MapPin, Clock, Users, Map, List, Calendar, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import InteractiveMap from '@/components/maps/InteractiveMap';
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
  classInfo?: LocationClassInfo;
}

interface LocationClassInfo {
  totalClasses: number;
  ageRange: { min: number | null; max: number | null };
  dateRange: { start: string | null; end: string | null };
  schedules: string[]; // e.g., ["Mon 10:00-11:00", "Wed 9:00-10:00"]
}
function BookingError() {
  return (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <Text className="font-poppins text-gray-600 mb-4">Map component failed to load</Text>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    </div>
  );
}
const FindClasses: React.FC = () => {
  const {
    franchiseeSlug
  } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow');
  const {
    flowData,
    loadFlow,
    updateFlow,
    isLoading: flowLoading
  } = useBookingFlow(flowId || undefined, franchiseeSlug);
  const [locations, setLocations] = useState<BookingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  const [flowLoaded, setFlowLoaded] = useState(false);
  
  useEffect(() => {
    if (!flowId) {
      navigate(`/${franchiseeSlug}/free-trial`);
      return;
    }
    loadData();
  }, [franchiseeSlug, flowId]);

  const getLocationClassInfo = async (locationId: string): Promise<LocationClassInfo> => {
    try {
      const { data: classes, error } = await supabase
        .from('classes')
        .select(`
          id, name, min_age, max_age,
          class_schedules (
            id, start_time, end_time, day_of_week, 
            date_start, date_end, is_active
          )
        `)
        .eq('location_id', locationId)
        .eq('is_active', true);

      if (error) throw error;

      if (!classes || classes.length === 0) {
        return {
          totalClasses: 0,
          ageRange: { min: null, max: null },
          dateRange: { start: null, end: null },
          schedules: []
        };
      }

      // Calculate age range across all classes
      let minAge = null;
      let maxAge = null;
      let earliestStart = null;
      let latestEnd = null;
      const schedules: string[] = [];

      classes.forEach(classItem => {
        // Update age ranges
        if (classItem.min_age !== null) {
          minAge = minAge === null ? classItem.min_age : Math.min(minAge, classItem.min_age);
        }
        if (classItem.max_age !== null) {
          maxAge = maxAge === null ? classItem.max_age : Math.max(maxAge, classItem.max_age);
        }

        // Process schedules
        classItem.class_schedules?.forEach(schedule => {
          if (!schedule.is_active) return;

          // Update date ranges
          if (schedule.date_start) {
            earliestStart = earliestStart === null ? schedule.date_start : 
              new Date(schedule.date_start) < new Date(earliestStart) ? schedule.date_start : earliestStart;
          }
          if (schedule.date_end) {
            latestEnd = latestEnd === null ? schedule.date_end :
              new Date(schedule.date_end) > new Date(latestEnd) ? schedule.date_end : latestEnd;
          }

          // Format schedule display
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[schedule.day_of_week] || 'Unknown';
          const timeRange = `${schedule.start_time || ''}-${schedule.end_time || ''}`;
          schedules.push(`${dayName} ${timeRange}`);
        });
      });

      return {
        totalClasses: classes.length,
        ageRange: { min: minAge, max: maxAge },
        dateRange: { start: earliestStart, end: latestEnd },
        schedules: schedules.slice(0, 3) // Limit to first 3 schedules for display
      };
    } catch (error) {
      console.error('Error fetching class info for location:', locationId, error);
      return {
        totalClasses: 0,
        ageRange: { min: null, max: null },
        dateRange: { start: null, end: null },
        schedules: []
      };
    }
  };
  const loadData = async () => {
    if (!franchiseeSlug || !flowId) {
      setError('Missing required parameters');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Load flow data first
      await loadFlow(flowId);
      setFlowLoaded(true);

      // Get franchisee by slug
      const {
        data: franchisee,
        error: franchiseeError
      } = await supabase.from('franchisees').select('*').eq('slug', franchiseeSlug).single();
      if (franchiseeError || !franchisee) {
        throw new Error('Franchisee not found');
      }
      setFranchiseeData(franchisee);

      // Load locations for this franchisee
      const {
        data: locationsData,
        error: locationsError
      } = await supabase.from('locations').select('*').eq('franchisee_id', franchisee.id).eq('is_active', true).order('name');
      if (locationsError) {
        throw locationsError;
      }

      // Convert database locations to BookingLocation format with validation
      const basicLocations: BookingLocation[] = (locationsData || []).filter(loc => {
        return loc && loc.id && loc.name && loc.address && loc.city && loc.state && loc.zip;
      }).map(loc => ({
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
      })).filter(loc => {
        return typeof loc.id === 'string' && typeof loc.name === 'string' && typeof loc.address === 'string';
      });

      // Fetch class information for each location
      const locationsWithClassInfo = await Promise.all(
        basicLocations.map(async (location) => {
          const classInfo = await getLocationClassInfo(location.id);
          return { ...location, classInfo };
        })
      );

      setLocations(locationsWithClassInfo);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      toast.error('Failed to load locations');
      // If flow loading fails, redirect to start over
      navigate(`/${franchiseeSlug}/free-trial`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLocationSelect = async (location: BookingLocation) => {
    if (!flowId) {
      toast.error('Session expired. Please start over.');
      return;
    }
    if (!location || !location.id || !location.name) {
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
      navigate(`/${franchiseeSlug}/free-trial/classes?flow=${flowId}`);
    } catch (error) {
      console.error('Error updating flow:', error);
      toast.error('Failed to select location. Please try again.');
    }
  };
  const handleRequestLocation = () => {
    // TODO: Implement location request modal
    toast.info('Location request feature coming soon');
  };
  const handleMapError = () => {
    setViewMode('list');
    toast.info('Map is unavailable, showing list view');
  };

  const formatAgeRange = (ageRange: { min: number | null; max: number | null }) => {
    if (ageRange.min === null && ageRange.max === null) {
      return 'All ages';
    }
    if (ageRange.min === null) {
      return `Up to ${ageRange.max} years`;
    }
    if (ageRange.max === null) {
      return `${ageRange.min}+ years`;
    }
    if (ageRange.min === ageRange.max) {
      return `${ageRange.min} years`;
    }
    return `${ageRange.min}-${ageRange.max} years`;
  };

  const formatDateRange = (dateRange: { start: string | null; end: string | null }) => {
    if (!dateRange.start && !dateRange.end) {
      return 'Ongoing';
    }
    
    const formatDate = (dateStr: string) => {
      try {
        return new Date(dateStr).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    if (dateRange.start && !dateRange.end) {
      return `From ${formatDate(dateRange.start)}`;
    }
    if (!dateRange.start && dateRange.end) {
      return `Until ${formatDate(dateRange.end)}`;
    }
    if (dateRange.start && dateRange.end) {
      return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    }
    return 'Ongoing';
  };

  // Show loading state while data is being loaded
  if (isLoading || flowLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-4 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#031E4D' }}></div>
          <p className="font-poppins text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Title order={2} className="font-agrandir text-2xl text-brand-navy mb-4">Unable to Load Locations</Title>
          <Text className="font-poppins text-gray-600 mb-6">{error}</Text>
          <Button onClick={() => navigate(`/${franchiseeSlug}/free-trial`)} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins">
            Start Over
          </Button>
        </div>
      </div>
    );
  }
  const currentLeadData = flowData?.leadData;
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div style={{ backgroundColor: '#031E4D' }} className="text-white py-8">
        <div className="container mx-auto px-4">
          <img 
            src="https://pub-6d374fd755954f29bcb59d4f2c5c7fe7.r2.dev/media/SS%20Logos_2021-03.svg" 
            alt="Soccer Stars" 
            className="h-16 w-auto mb-2"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <h2 className="text-xl font-medium font-poppins">Find Classes Near You</h2>
          {currentLeadData && (
            <p className="font-poppins text-sm opacity-90 mt-2 text-slate-400">
              Hello {currentLeadData.firstName}, let's find classes near {currentLeadData.zip}
            </p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-2 font-poppins" style={{ color: '#031E4D' }}>Available Locations</h3>
            {franchiseeData && (
              <p className="font-poppins text-gray-600">
                {franchiseeData.company_name} - {locations.length} location{locations.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-poppins transition-colors ${
                viewMode === 'list' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={viewMode === 'list' ? { backgroundColor: '#CE0E2D' } : {}}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-poppins transition-colors ${
                viewMode === 'map' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={viewMode === 'map' ? { backgroundColor: '#CE0E2D' } : {}}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
          </div>
        </div>

        {/* Responsive layout: Desktop side-by-side, Mobile stacked */}
        <div className={`${viewMode === 'map' ? 'lg:grid lg:grid-cols-5 lg:gap-8' : ''}`}>
          {/* Map View - Now with proper aspect ratio */}
          {viewMode === 'map' && <div className="lg:col-span-3 mb-8 lg:mb-0">
              <div className="relative">
                <ErrorBoundary fallback={BookingError} onReset={handleMapError}>
                  <InteractiveMap locations={locations} aspectRatio={4 / 3} // 4:3 aspect ratio for better display
              franchiseeSlug={franchiseeSlug || ''} flowId={flowId || undefined} onLocationSelect={handleLocationSelect} className="w-full" />
                </ErrorBoundary>
              </div>
            </div>}
          
          {/* Locations List - Now takes remaining space */}
          <div className={viewMode === 'map' ? 'lg:col-span-2' : ''}>
            <div className="space-y-4">
              {locations.length > 0 ? locations.map(location => (
                <div 
                  key={location.id} 
                  className="bg-white rounded-lg border border-l-4 hover:shadow-lg transition-all duration-200 p-6"
                  style={{ borderLeftColor: '#031E4D' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-3 font-poppins" style={{ color: '#031E4D' }}>
                        {location.name}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                          <p className="font-poppins text-gray-600">
                            {location.address}<br />
                            {location.city}, {location.state} {location.zip}
                          </p>
                        </div>
                        {location.phone && (
                          <p className="font-poppins text-sm text-gray-600">
                            📞 {location.phone}
                          </p>
                        )}
                        {location.email && (
                          <p className="font-poppins text-sm text-gray-600">
                            ✉️ {location.email}
                          </p>
                        )}

                        {/* Class Information Section */}
                        {location.classInfo && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="space-y-2">
                              {/* Classes Count */}
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="font-poppins text-sm font-medium text-gray-700">
                                  {location.classInfo.totalClasses} {location.classInfo.totalClasses === 1 ? 'class' : 'classes'} available
                                </span>
                              </div>

                              {/* Age Range */}
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="font-poppins text-sm text-gray-600">
                                  Ages: {formatAgeRange(location.classInfo.ageRange)}
                                </span>
                              </div>

                              {/* Date Range */}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="font-poppins text-sm text-gray-600">
                                  {formatDateRange(location.classInfo.dateRange)}
                                </span>
                              </div>

                              {/* Sample Schedules */}
                              {location.classInfo.schedules.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                                  <div className="flex flex-wrap gap-1">
                                    {location.classInfo.schedules.map((schedule, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="light" 
                                        size="xs" 
                                        className="font-poppins"
                                        color="blue"
                                      >
                                        {schedule}
                                      </Badge>
                                    ))}
                                    {location.classInfo.totalClasses > 3 && (
                                      <Badge variant="light" size="xs" color="gray">
                                        +{location.classInfo.totalClasses - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-6">
                      <button 
                        onClick={() => handleLocationSelect(location)}
                        className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90 font-poppins"
                        style={{ backgroundColor: '#CE0E2D' }}
                      >
                        Select Location
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center bg-white rounded-lg border border-l-4 p-8" style={{ borderLeftColor: '#CE0E2D' }}>
                  <div className="flex flex-col items-center space-y-4">
                    <MapPin className="h-16 w-16 text-gray-400" />
                    <h3 className="text-xl font-bold font-poppins" style={{ color: '#031E4D' }}>
                      No Locations Found Near You
                    </h3>
                    <p className="font-poppins text-gray-600 max-w-md text-center">
                      We don't currently have any locations within 50km of your area ({currentLeadData?.zip}).
                      Would you like us to notify you when programs become available in your area?
                    </p>
                    <button 
                      onClick={handleRequestLocation}
                      className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90 font-poppins"
                      style={{ backgroundColor: '#CE0E2D' }}
                    >
                      Request Programs in My Area
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation hint */}
        {locations.length > 0 && (
          <Card className="mt-8 bg-blue-50 border border-blue-200" padding="md" radius="md">
            <Text className="font-poppins text-blue-800 text-center">
              💡 Select a location above to view available classes and book your free trial
            </Text>
          </Card>
        )}
      </div>
    </div>
  );
};
export default FindClasses;