
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Group, Title } from '@mantine/core';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import ProgramDetailsCard from '@/components/classes/ProgramDetailsCard';
import EditableClassesTable from '@/components/classes/EditableClassesTable';
import { useProgramForm } from '@/hooks/useProgramForm';

interface ClassRowData {
  id: string;
  className: string;
  startTime: string;
  duration: number;
  endTime: string;
  minAge: number;
  maxAge: number;
  capacity: number;
}

const AddClasses: React.FC = () => {
  const navigate = useNavigate();
  const { data: franchiseeData } = useFranchiseeData();
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    programData,
    setProgramData,
    classRows,
    setClassRows,
    isProgramValid,
    addClassRow,
    removeClassRow,
    updateClassRow
  } = useProgramForm();

  const handleSave = async () => {
    if (!franchiseeData?.id || !isProgramValid || classRows.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const createdClasses = [];
      
      // Create each class with merged program + class data
      for (const classRow of classRows) {
        if (!classRow.className.trim()) {
          toast.error("All classes must have a name");
          setIsSaving(false);
          return;
        }

        // Create class record
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .insert([
            {
              franchisee_id: franchiseeData.id,
              name: classRow.className,
              class_name: classRow.className,
              description: `${classRow.className} program`,
              duration_minutes: classRow.duration,
              max_capacity: classRow.capacity,
              min_age: classRow.minAge,
              max_age: classRow.maxAge,
              location_id: programData.locationId,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (classError) {
          console.error("Error creating class:", classError);
          toast.error(`Failed to create class: ${classRow.className}`);
          setIsSaving(false);
          return;
        }

        // Create class schedule for each selected day
        for (const dayOfWeek of programData.daysOfWeek) {
          const { error: scheduleError } = await supabase
            .from('class_schedules')
            .insert([
              {
                class_id: classData.id,
                start_time: classRow.startTime,
                end_time: classRow.endTime,
                date_start: programData.startDate || null,
                date_end: programData.endDate || null,
                day_of_week: dayOfWeek,
                current_bookings: 0,
                is_active: true,
              },
            ]);

          if (scheduleError) {
            console.error("Error creating class schedule:", scheduleError);
            toast.error(`Failed to create schedule for ${classRow.className}`);
            setIsSaving(false);
            return;
          }
        }

        createdClasses.push(classData);
      }

      toast.success(`Successfully created ${createdClasses.length} classes`);
      navigate('/portal/classes/list');
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portal/classes/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <Title order={1} size="30px" lh="36px" fw={600}>
            Create Program
          </Title>
        </div>
        <Group gap="md">
          <Button
            variant="outline"
            onClick={addClassRow}
            disabled={!isProgramValid}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isProgramValid || classRows.length === 0}
          >
            {isSaving ? (
              <>
                <span className="animate-pulse">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Program & Save All
              </>
            )}
          </Button>
        </Group>
      </div>

      <Stack gap="lg">
        <ProgramDetailsCard
          programData={programData}
          onProgramDataChange={setProgramData}
          franchiseeId={franchiseeData?.id}
        />

        <EditableClassesTable
          classRows={classRows}
          onUpdateRow={updateClassRow}
          onRemoveRow={removeClassRow}
          disabled={!isProgramValid}
        />
      </Stack>
    </div>
  );
};

export default AddClasses;
