
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LocationSelector from '@/components/classes/LocationSelector';
import GlobalDayPicker from '@/components/classes/GlobalDayPicker';
import ScheduleGrid from '@/components/classes/ScheduleGrid';

export interface ScheduleRow {
  id?: string;
  className: string;
  duration: number;
  timeStart: string;
  timeEnd: string;
  dateStart: string;
  dateEnd: string;
  overrideDates: string[];
  minAge: number;
  maxAge: number;
  capacity: number;
  dayOfWeek: number;
}

const PortalClasses: React.FC = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [globalDayOfWeek, setGlobalDayOfWeek] = useState<number>(1); // Monday default
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [franchiseeId, setFranchiseeId] = useState<string | null>(null);

  // Get franchisee ID on component mount
  useEffect(() => {
    const getFranchiseeId = async () => {
      try {
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
          console.error("Error fetching franchisee:", error);
          toast.error("Unable to find franchisee account");
          return;
        }
        
        setFranchiseeId(franchisee.id);
      } catch (error) {
        console.error("Error getting franchisee:", error);
        toast.error("Failed to authenticate");
      }
    };

    getFranchiseeId();
  }, []);

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleAddRow = () => {
    const lastRow = scheduleRows[scheduleRows.length - 1];
    const newRow: ScheduleRow = lastRow ? {
      ...lastRow,
      id: undefined, // New row gets new ID
      className: '', // Reset class name for new row
    } : {
      className: '',
      duration: 60,
      timeStart: '09:00',
      timeEnd: '10:00',
      dateStart: '',
      dateEnd: '',
      overrideDates: [],
      minAge: 3,
      maxAge: 12,
      capacity: 12,
      dayOfWeek: globalDayOfWeek,
    };
    
    setScheduleRows([...scheduleRows, newRow]);
  };

  const handleRowChange = (index: number, field: keyof ScheduleRow, value: any) => {
    const updatedRows = [...scheduleRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    
    // Auto-calculate end time when start time or duration changes
    if (field === 'timeStart' || field === 'duration') {
      const startTime = field === 'timeStart' ? value : updatedRows[index].timeStart;
      const duration = field === 'duration' ? value : updatedRows[index].duration;
      updatedRows[index].timeEnd = calculateEndTime(startTime, duration);
    }
    
    setScheduleRows(updatedRows);
  };

  const handleRemoveRow = (index: number) => {
    const updatedRows = scheduleRows.filter((_, i) => i !== index);
    setScheduleRows(updatedRows);
  };

  const handleSaveAll = async () => {
    if (!selectedLocationId) {
      toast.error("Please select a location first");
      return;
    }

    if (scheduleRows.length === 0) {
      toast.error("Please add at least one schedule");
      return;
    }

    // Validate that all rows have class names
    const rowsWithoutNames = scheduleRows.filter(row => !row.className.trim());
    if (rowsWithoutNames.length > 0) {
      toast.error("Please provide a class name for all rows");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create separate classes for each row
      for (const [index, row] of scheduleRows.entries()) {
        console.log(`Creating class ${index + 1}: ${row.className}`);
        
        // Create the class
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .insert({
            location_id: selectedLocationId,
            name: row.className,
            class_name: row.className,
            description: `${row.className} - Soccer class for kids`,
            duration_minutes: row.duration,
            max_capacity: row.capacity,
            min_age: row.minAge,
            max_age: row.maxAge,
            is_active: true
          })
          .select()
          .single();

        if (classError) {
          console.error(`Error creating class ${index + 1}:`, classError);
          throw classError;
        }

        console.log(`Created class ${index + 1}:`, classData);

        // Create the schedule for this class
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('class_schedules')
          .insert({
            class_id: classData.id,
            start_time: row.timeStart,
            end_time: row.timeEnd,
            date_start: row.dateStart || null,
            date_end: row.dateEnd || null,
            day_of_week: row.dayOfWeek,
            current_bookings: 0,
            is_active: true
          })
          .select()
          .single();

        if (scheduleError) {
          console.error(`Error creating schedule for class ${index + 1}:`, scheduleError);
          throw scheduleError;
        }

        console.log(`Created schedule for class ${index + 1}:`, scheduleData);

        // Handle override dates if any
        if (row.overrideDates.length > 0) {
          const exceptionInserts = row.overrideDates.map(date => ({
            class_schedule_id: scheduleData.id,
            exception_date: date,
            is_cancelled: true
          }));

          const { error: exceptionError } = await supabase
            .from('schedule_exceptions')
            .insert(exceptionInserts);

          if (exceptionError) {
            console.error(`Error creating exceptions for class ${index + 1}:`, exceptionError);
            throw exceptionError;
          }
        }
      }

      toast.success(`Successfully created ${scheduleRows.length} class schedules!`);
      
      // Reset form
      setScheduleRows([]);
      setSelectedLocationId('');
      
    } catch (error) {
      console.error("Error saving schedules:", error);
      toast.error("Failed to save schedules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Class Schedules</h1>
        <Button 
          onClick={handleSaveAll} 
          disabled={!selectedLocationId || scheduleRows.length === 0 || isLoading}
        >
          {isLoading ? "Saving..." : "Save All Schedules"}
        </Button>
      </div>

      <div className="space-y-4">
        <LocationSelector
          franchiseeId={franchiseeId}
          selectedLocationId={selectedLocationId}
          onLocationChange={setSelectedLocationId}
        />

        {selectedLocationId && (
          <>
            <GlobalDayPicker
              selectedDay={globalDayOfWeek}
              onDayChange={setGlobalDayOfWeek}
            />

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Schedule Grid</h3>
                <Button onClick={handleAddRow} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>

              <ScheduleGrid
                rows={scheduleRows}
                onRowChange={handleRowChange}
                onRemoveRow={handleRemoveRow}
                globalDayOfWeek={globalDayOfWeek}
              />
            </div>
          </>
        )}

        {!selectedLocationId && (
          <div className="rounded-md border border-dashed border-gray-300">
            <div className="p-8 flex items-center justify-center">
              <p className="text-muted-foreground">Select a location to start creating class schedules.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalClasses;
