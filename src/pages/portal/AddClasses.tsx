
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Group, Title } from '@mantine/core';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import ProgramDetailsCard from '@/components/classes/ProgramDetailsCard';
import EditableClassesTable from '@/components/classes/EditableClassesTable';
import { useProgramForm } from '@/hooks/useProgramForm';
import { useCreateProgramWithClasses } from '@/hooks/useCreateProgramWithClasses';

const AddClasses: React.FC = () => {
  const navigate = useNavigate();
  const { data: franchiseeData } = useFranchiseeData();
  
  const {
    programData,
    setProgramData,
    classRows,
    isProgramValid,
    areClassesValid,
    areOverrideDatesValid,
    addClassRow,
    removeClassRow,
    updateClassRow,
    addOverrideDate,
    removeOverrideDate,
  } = useProgramForm();

  const createProgramMutation = useCreateProgramWithClasses();

  const handleSave = async () => {
    if (!franchiseeData?.id || !isProgramValid || !areClassesValid || !areOverrideDatesValid || classRows.length === 0) {
      toast.error("Please fill in all required fields and fix any validation errors");
      return;
    }

    try {
      const result = await createProgramMutation.mutateAsync({
        programData,
        classRows,
        franchiseeId: franchiseeData.id
      });

      toast.success(`Successfully created ${classRows.length} classes`);
      navigate('/portal/classes');
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save program");
    }
  };

  const canSave = isProgramValid && areClassesValid && areOverrideDatesValid && classRows.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portal/classes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <Title order={1} size="30px" lh="36px" fw={600}>
            Create Program
          </Title>
        </div>
      </div>

      <Stack gap="lg">
        <ProgramDetailsCard
          programData={programData}
          onProgramDataChange={setProgramData}
          franchiseeId={franchiseeData?.id}
          onAddOverrideDate={addOverrideDate}
          onRemoveOverrideDate={removeOverrideDate}
        />

        <EditableClassesTable
          classRows={classRows}
          onUpdateRow={updateClassRow}
          onRemoveRow={removeClassRow}
          onAddRow={addClassRow}
          disabled={!isProgramValid}
        />

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            disabled={createProgramMutation.isPending || !canSave}
            loading={createProgramMutation.isPending}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Program & Save All
          </Button>
        </div>
      </Stack>
    </div>
  );
};

export default AddClasses;
