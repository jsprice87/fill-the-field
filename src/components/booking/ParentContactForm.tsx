
import React from 'react';

interface ParentContactFormProps {
  parentContact: { first_name: string; last_name: string; email: string; phone: string };
  setParentContact: (contact: { first_name: string; last_name: string; email: string; phone: string }) => void;
}

// TODO: real implementation
export function ParentContactForm({ parentContact, setParentContact }: ParentContactFormProps) {
  return null;
}

export default ParentContactForm;
