
import React from 'react';
import { Baby } from 'lucide-react';

interface ParticipantCellProps {
  participantName: string;
  participantBirthDate: string;
  participantAge: number;
}

const ParticipantCell: React.FC<ParticipantCellProps> = ({ 
  participantName, 
  participantBirthDate, 
  participantAge 
}) => {
  const formatAge = (birthDateString: string, ageNumber: number) => {
    if (birthDateString) {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return months > 0 ? `${years}Y ${months}M` : `${years}Y`;
      } else {
        return `${months}M`;
      }
    }
    return `${ageNumber}Y`;
  };

  return (
    <div className="space-y-1">
      <div className="font-medium">{participantName}</div>
      <div className="flex items-center text-sm text-gray-600">
        <Baby className="h-3 w-3 mr-1" />
        {formatAge(participantBirthDate, participantAge)}
      </div>
    </div>
  );
};

export default ParticipantCell;
