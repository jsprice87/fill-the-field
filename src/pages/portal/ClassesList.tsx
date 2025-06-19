import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";
import { getSlugFromFranchiseeId } from "@/utils/slugUtils";

interface ClassWithDetails {
  id: string;
  name: string;
  class_name: string;
  location_name: string;
  location_id: string;
  duration_minutes: number;
  max_capacity: number;
  min_age: number;
  max_age: number;
  is_active: boolean;
  schedules: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[];
}

interface ClassesListProps {
  franchiseeId?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ClassesList: React.FC<ClassesListProps> = ({ franchiseeId: propFranchiseeId }) => {
  const { franchiseeSlug } = useParams();
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassWithDetails[]>([]);
  const [locations, setLocations] = useState<{id: string, name: string}[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [currentFranchiseeId, setCurrentFranchiseeId] = useState<string | null>(propFranchiseeId || null);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  console.log('ClassesList: Rendered with props franchiseeId:', propFranchiseeId);
  console.log('ClassesList: URL franchiseeSlug:', franchiseeSlug);

  // Get the current slug for navigation
  useEffect(() => {
    if (franchiseeSlug) {
      if (!franchiseeSlug.includes('-')) {
        getSlugFromFranchiseeId(franchiseeSlug).then(slug => {
          setCurrentSlug(slug || franchiseeSlug);
        });
      } else {
        setCurrentSlug(franchiseeSlug);
      }
    }
  }, [franchiseeSlug]);

  // Set franchisee ID from props or fetch from session
  useEffect(() => {
    if (propFranchiseeId) {
      console.log('ClassesList: Using franchiseeId from props:', propFranchiseeId);
      setCurrentFranchiseeId(propFranchiseeId);
      return;
    }

    const getFranchiseeId = async () => {
      try {
        console.log('ClassesList: Getting franchisee ID from session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("Authentication required");
          return;
        }

        const { data: franchisee, error } = await supabase
          .from('franchisees')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (error || !franchisee) {
          console.error("ClassesList: Error fetching franchisee:", error);
          toast.error("Unable to find franchisee account");
          return;
        }
        
        console.log('ClassesList: Found franchiseeId from session:', franchisee.id);
        setCurrentFranchiseeId(franchisee.id);
      } catch (error) {
        console.error("ClassesList: Error getting franchisee:", error);
        toast.error("Failed to authenticate");
      }
    };

    getFranchiseeId();
  }, [propFranchiseeId]);

  useEffect(() => {
    if (currentFranchiseeId) {
      loadClassesAndLocations();
    }
  }, [currentFranchiseeId]);

  useEffect(() => {
    filterClasses();
  }, [classes, selectedLocationId, searchTerm]);

  const loadClassesAndLocations = async () => {
    try {
      console.log('ClassesList: Loading data for franchiseeId:', currentFranchiseeId);

      // Load locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name')
        .eq('franchisee_id', currentFranchiseeId)
        .eq('is_active', true)
        .order('name');

      if (locationsError) {
        console.error("ClassesList: Error loading locations:", locationsError);
        toast.error("Failed to load locations");
        return;
      }

      setLocations(locationsData || []);

      // Load classes with location info and schedules
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          class_name,
          duration_minutes,
          max_capacity,
          min_age,
          max_age,
          is_active,
          location_id,
          locations!inner(name),
          class_schedules(
            day_of_week,
            start_time,
            end_time
          )
        `)
        .eq('locations.franchisee_id', currentFranchiseeId)
        .eq('is_active', true)
        .order('name');

      if (classesError) {
        console.error("ClassesList: Error loading classes:", classesError);
        toast.error("Failed to load classes");
        return;
      }

      console.log('ClassesList: Loaded classes:', classesData);

      const formattedClasses: ClassWithDetails[] = (classesData || []).map(cls => ({
        id: cls.id,
        name: cls.name,
        class_name: cls.class_name,
        location_name: (cls.locations as any).name,
        location_id: cls.location_id,
        duration_minutes: cls.duration_minutes,
        max_capacity: cls.max_capacity,
        min_age: cls.min_age,
        max_age: cls.max_age,
        is_active: cls.is_active,
        schedules: cls.class_schedules || []
      }));

      setClasses(formattedClasses);
    } catch (error) {
      console.error("ClassesList: Error loading data:", error);
      toast.error("Failed to load class data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    if (selectedLocationId !== 'all') {
      filtered = filtered.filter(cls => cls.location_id === selectedLocationId);
    }

    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  };

  const handleClassSelection = (classId: string, selected: boolean) => {
    const newSelection = new Set(selectedClasses);
    if (selected) {
      newSelection.add(classId);
    } else {
      newSelection.delete(classId);
    }
    setSelectedClasses(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedClasses.size === filteredClasses.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(filteredClasses.map(cls => cls.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClasses.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedClasses.size} class${selectedClasses.size > 1 ? 'es' : ''}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .in('id', Array.from(selectedClasses));

      if (error) throw error;

      toast.success(`${selectedClasses.size} class${selectedClasses.size > 1 ? 'es' : ''} deleted successfully`);
      setSelectedClasses(new Set());
      loadClassesAndLocations();
    } catch (error) {
      console.error("Error deleting classes:", error);
      toast.error("Failed to delete classes");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', classId);

      if (error) {
        console.error("Error deleting class:", error);
        throw error;
      }

      toast.success("Class deleted successfully");
      loadClassesAndLocations();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    }
  };

  const formatSchedule = (schedules: ClassWithDetails['schedules']) => {
    if (!schedules || schedules.length === 0) return 'No schedule';
    
    return schedules.map(schedule => 
      `${DAYS_OF_WEEK[schedule.day_of_week]} ${schedule.start_time}-${schedule.end_time}`
    ).join(', ');
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <header className="pl-sidebar sticky top-0 z-40 px-6 pt-6 pb-4 bg-background border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-h1 text-gray-900 dark:text-gray-50">Classes</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner h-8 w-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Sidebar Clearance */}
      <header className="pl-sidebar sticky top-0 z-40 px-6 pt-6 pb-4 bg-background border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-h1 text-gray-900 dark:text-gray-50">Classes</h1>
            <p className="text-body-sm text-muted-foreground">
              Manage your class schedules and programs
            </p>
          </div>
          <div className="flex items-center gap-4">
            {selectedClasses.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="motion-safe:transition-all motion-safe:duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedClasses.size})
              </Button>
            )}
            <Link to={`/${currentSlug}/portal/classes/add`}>
              <Button className="motion-safe:transition-all motion-safe:duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Classes
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 interactive-input"
            />
          </div>
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Table Container with Proper Overflow */}
      <div className="table-container px-6 pb-6">
        <div className="mt-6">
          {filteredClasses.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                {classes.length === 0 
                  ? "No classes found. Click 'Add Classes' to create your first class."
                  : "No classes match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedClasses.size === filteredClasses.length && filteredClasses.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                    </TableHead>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Age Range</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow 
                      key={classItem.id}
                      interactive
                      className={`
                        ${selectedClasses.has(classItem.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                        ${hoveredRow === classItem.id ? 'bg-gray-50 dark:bg-gray-800' : ''}
                        motion-safe:transition-colors motion-safe:duration-200
                      `}
                      onMouseEnter={() => setHoveredRow(classItem.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedClasses.has(classItem.id)}
                          onChange={(e) => handleClassSelection(classItem.id, e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{classItem.class_name}</TableCell>
                      <TableCell>{classItem.location_name}</TableCell>
                      <TableCell>{formatSchedule(classItem.schedules)}</TableCell>
                      <TableCell>{classItem.duration_minutes} min</TableCell>
                      <TableCell>{classItem.min_age}-{classItem.max_age} years</TableCell>
                      <TableCell>{classItem.max_capacity}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link to={`/${currentSlug}/portal/classes/edit/${classItem.id}`}>
                            <Button variant="ghost" size="sm" className="ui-hover">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClass(classItem.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ui-hover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassesList;
