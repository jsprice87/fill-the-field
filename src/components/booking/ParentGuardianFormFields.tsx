
import React from 'react';
import { TextInput } from '@mantine/core';
import { Label } from '@/components/ui/label';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parentFirstName" className="font-poppins">First Name *</Label>
          <TextInput
            id="parentFirstName"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            placeholder="Parent/Guardian first name"
            className="font-poppins"
            required
          />
        </div>
        <div>
          <Label htmlFor="parentLastName" className="font-poppins">Last Name *</Label>
          <TextInput
            id="parentLastName"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            placeholder="Parent/Guardian last name"
            className="font-poppins"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="parentEmail" className="font-poppins">Email Address *</Label>
        <TextInput
          id="parentEmail"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="your.email@example.com"
          className="font-poppins"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parentPhone" className="font-poppins">Phone Number *</Label>
          <TextInput
            id="parentPhone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="font-poppins"
            required
          />
        </div>
        <div>
          <Label htmlFor="parentZip" className="font-poppins">ZIP Code *</Label>
          <TextInput
            id="parentZip"
            value={formData.zip}
            onChange={(e) => onInputChange('zip', e.target.value)}
            placeholder="12345"
            className="font-poppins"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="relationship" className="font-poppins">Relationship to Child(ren)</Label>
        <TextInput
          id="relationship"
          value={formData.relationship}
          onChange={(e) => onInputChange('relationship', e.target.value)}
          placeholder="Parent, Guardian, etc."
          className="font-poppins"
        />
      </div>
    </>
  );
};
