
import React from 'react';
import { Title, Stack } from '@mantine/core';
import { PortalShell } from '@/layout/PortalShell';
import { StickyHeader } from '@/components/mantine';
import ProgramDetailsCard from '@/components/classes/ProgramDetailsCard';
import EditableClassesTable from '@/components/classes/EditableClassesTable';
import { useProgramForm } from '@/hooks/useProgramForm';

const AddClassesProgram: React.FC = () => {
  const {
    programData,
    setProgramData,
    classRows,
    addClassRow,
    updateClassRow,
    deleteClassRow,
    isValidProgram,
    createProgram,
    isCreating
  } = useProgramForm();

  return (
    <PortalShell>
      <Stack h="100vh" gap={0} w="100%">
        <StickyHeader>
          <Title order={1} size="30px" lh="36px" fw={600}>
            Create Program
          </Title>
        </StickyHeader>

        <Stack gap="lg" p="md" style={{ flex: 1, overflow: 'auto' }}>
          <ProgramDetailsCard
            data={programData}
            onChange={setProgramData}
          />

          <EditableClassesTable
            classes={classRows}
            onAddClass={addClassRow}
            onUpdateClass={updateClassRow}
            onDeleteClass={deleteClassRow}
            onCreateProgram={createProgram}
            isValidProgram={isValidProgram}
            isCreating={isCreating}
          />
        </Stack>
      </Stack>
    </PortalShell>
  );
};

export default AddClassesProgram;
