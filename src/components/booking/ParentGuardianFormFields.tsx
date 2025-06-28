
import React from 'react';
import { TextInput, Grid } from '@mantine/core';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  relationship: string;
}

interface ParentGuardianFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const ParentGuardianFormFields: React.FC<ParentGuardianFormFieldsProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            id="parentFirstName"
            label="First Name *"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            placeholder="Parent/Guardian first name"
            className="font-poppins"
            required
            size="md"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            id="parentLastName"
            label="Last Name *"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            placeholder="Parent/Guardian last name"
            className="font-poppins"
            required
            size="md"
          />
        </Grid.Col>
      </Grid>

      <TextInput
        id="parentEmail"
        label="Email Address *"
        type="email"
        value={formData.email}
        onChange={(e) => onInputChange('email', e.target.value)}
        placeholder="your.email@example.com"
        className="font-poppins"
        required
        size="md"
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            id="parentPhone"
            label="Phone Number *"
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="font-poppins"
            required
            size="md"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            id="parentZip"
            label="ZIP Code *"
            value={formData.zip}
            onChange={(e) => onInputChange('zip', e.target.value)}
            placeholder="12345"
            className="font-poppins"
            required
            size="md"
          />
        </Grid.Col>
      </Grid>

      <TextInput
        id="relationship"
        label="Relationship to Child(ren)"
        value={formData.relationship}
        onChange={(e) => onInputChange('relationship', e.target.value)}
        placeholder="Parent, Guardian, etc."
        className="font-poppins"
        size="md"
      />
    </>
  );
};
