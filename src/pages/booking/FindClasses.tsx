import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Users, Clock, ArrowLeft, ArrowRight, Filter, Search } from 'lucide-react';
import { TextInput } from '@mantine/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeBySlug';
import { useActiveClassSchedules } from '@/hooks/useActiveClassSchedules';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { formatTimeInTimezone } from '@/utils/timezoneUtils';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';

interface ClassScheduleFilter {
  locationId?: string;
  dayOfWeek?: string;
}

const FindClasses: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [classScheduleFilter, setClassScheduleFilter] = useState<ClassScheduleFilter>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: franchisee, isLoading: isFranchiseeLoading, isError: isFranchiseeError } = useFranchiseeBySlug(franchiseeSlug);
  const { data: settings, isLoading: isSettingsLoading } = useFranchiseeSettings();

  const timezone = settings?.timezone || 'America/New_York';

  const { data: classSchedules, isLoading: isClassesLoading, isError: isClassesError } = useActiveClassSchedules(
    franchisee?.id,
    classScheduleFilter.locationId,
    classScheduleFilter.dayOfWeek,
    searchQuery
  );

  const handleClassSelect = (classScheduleId: string) => {
    navigate(`/${franchiseeSlug}/booking/${classScheduleId}`);
  };

  const handleFilterChange = (filter: ClassScheduleFilter) => {
    setClassScheduleFilter(filter);
    setIsFilterOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isFranchiseeLoading || isSettingsLoading) {
    return <LoadingSpinner />;
  }

  if (isFranchiseeError || !franchisee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-6 text-center">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Franchisee not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MetaPixelProvider franchiseeId={franchisee.id}>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <Card className="shadow-md">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to={`/${franchiseeSlug}/`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <CardTitle className="text-xl font-semibold">Find Classes</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <TextInput
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  icon={<Search className="h-4 w-4 text-gray-500" />}
                  className="sm:w-64"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isFilterOpen && (
                <div className="p-4 bg-gray-100 border-b">
                  <ClassFilterForm
                    franchiseeId={franchisee.id}
                    onFilterChange={handleFilterChange}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </div>
              )}

              {isClassesLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner />
                </div>
              ) : isClassesError ? (
                <div className="p-6 text-center">
                  <p className="text-red-500">Error loading classes.</p>
                </div>
              ) : classSchedules && classSchedules.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {classSchedules.map((schedule) => (
                    <ClassCard
                      key={schedule.id}
                      schedule={schedule}
                      timezone={timezone}
                      onSelect={handleClassSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p>No classes found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MetaPixelProvider>
  );
};

interface ClassFilterFormProps {
  franchiseeId: string;
  onFilterChange: (filter: ClassScheduleFilter) => void;
  onClose: () => void;
}

const ClassFilterForm: React.FC<ClassFilterFormProps> = ({ franchiseeId, onFilterChange, onClose }) => {
  const [locationId, setLocationId] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const { data: locations, isLoading: isLocationsLoading } = useActiveClassSchedules(franchiseeId);

  const handleSubmit = () => {
    onFilterChange({ locationId, dayOfWeek });
    onClose();
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={setLocationId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Location" />
        </SelectTrigger>
        <SelectContent>
          {isLocationsLoading ? (
            <SelectItem value="">Loading...</SelectItem>
          ) : (
            <>
              <SelectItem value="">All Locations</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.classes.locations.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      <Select onValueChange={setDayOfWeek}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Day of Week" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any Day</SelectItem>
          <SelectItem value="0">Sunday</SelectItem>
          <SelectItem value="1">Monday</SelectItem>
          <SelectItem value="2">Tuesday</SelectItem>
          <SelectItem value="3">Wednesday</SelectItem>
          <SelectItem value="4">Thursday</SelectItem>
          <SelectItem value="5">Friday</SelectItem>
          <SelectItem value="6">Saturday</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

interface ClassCardProps {
  schedule: any;
  timezone: string;
  onSelect: (classScheduleId: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ schedule, timezone, onSelect }) => {
  const { classes, start_time, end_time, day_of_week } = schedule;
  const { name: locationName, city, state } = classes.locations;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[day_of_week];

  const formattedStartTime = formatTimeInTimezone(start_time, timezone);
  const formattedEndTime = formatTimeInTimezone(end_time, timezone);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{classes.name}</CardTitle>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {dayName}s
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <p className="text-sm">{locationName}, {city}, {state}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <p className="text-sm">{dayName}s, {formattedStartTime} - {formattedEndTime}</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <p className="text-sm">Ages {classes.min_age} - {classes.max_age}</p>
        </div>
      </CardContent>
      <Separator />
      <div className="p-4">
        <Button className="w-full" onClick={() => onSelect(schedule.id)}>
          Select Class
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default FindClasses;
