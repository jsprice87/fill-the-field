
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

  const handleAddRow = () => {
    const lastRow = scheduleRows[scheduleRows.length - 1];
    const newRow: ScheduleRow = lastRow ? {
      ...lastRow,
      id: undefined, // New row gets new ID
    } : {
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

    setIsLoading(true);
    
    try {
      // First create the class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert({
          location_id: selectedLocationId,
          name: 'Soccer Trial Class',
          description: 'Free trial soccer class for kids',
          duration_minutes: 60,
          max_capacity: Math.max(...scheduleRows.map(row => row.capacity)),
          min_age: Math.min(...scheduleRows.map(row => row.minAge)),
          max_age: Math.max(...scheduleRows.map(row => row.maxAge)),
          is_active: true
        })
        .select()
        .single();

      if (classError) {
        console.error("Error creating class:", classError);
        throw classError;
      }

      // Then create all schedules
      const scheduleInserts = scheduleRows.map(row => ({
        class_id: classData.id,
        start_time: row.timeStart,
        end_time: row.timeEnd,
        date_start: row.dateStart || null,
        date_end: row.dateEnd || null,
        day_of_week: row.dayOfWeek,
        current_bookings: 0,
        is_active: true
      }));

      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .insert(scheduleInserts);

      if (scheduleError) {
        console.error("Error creating schedules:", scheduleError);
        throw scheduleError;
      }

      // Handle override dates if any
      for (const [index, row] of scheduleRows.entries()) {
        if (row.overrideDates.length > 0) {
          // Get the schedule ID we just created
          const scheduleIndex = index;
          const exceptionInserts = row.overrideDates.map(date => ({
            class_schedule_id: classData.id, // This would need to be the actual schedule ID
            exception_date: date,
            is_cancelled: true
          }));

          await supabase
            .from('schedule_exceptions')
            .insert(exceptionInserts);
        }
      }

      toast.success('Class schedules saved successfully!');
      
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
