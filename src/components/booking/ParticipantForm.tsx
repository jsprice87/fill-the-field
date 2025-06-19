
import React from 'react';

interface ParticipantFormProps {
  participants: Array<{ first_name: string; last_name: string; age: number }>;
  setParticipants: (participants: Array<{ first_name: string; last_name: string; age: number }>) => void;
  minAge: number;
  maxAge: number;
  maxCapacity: number;
}

// TODO: real implementation
export function ParticipantForm({ 
  participants, 
  setParticipants, 
  minAge, 
  maxAge, 
  maxCapacity 
}: ParticipantFormProps) {
  return null;
}

export default ParticipantForm;
