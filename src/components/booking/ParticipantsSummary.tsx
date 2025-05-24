
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, X, Calendar, Clock } from 'lucide-react';

interface Participant {
  id: string;
  firstName: string;
  birthDate: string;
  age: number;
  classScheduleId: string;
  className: string;
  classTime: string;
  ageOverride?: boolean;
}

interface ParticipantsSummaryProps {
  participants: Participant[];
  onRemoveParticipant: (participantId: string) => void;
  onContinue: () => void;
}

const ParticipantsSummary: React.FC<ParticipantsSummaryProps> = ({
  participants,
  onRemoveParticipant,
  onContinue
}) => {
  if (participants.length === 0) {
    return null;
  }

  // Group participants by class
  const participantsByClass = participants.reduce((acc, participant) => {
    const key = `${participant.classScheduleId}-${participant.className}`;
    if (!acc[key]) {
      acc[key] = {
        className: participant.className,
        classTime: participant.classTime,
        participants: []
      };
    }
    acc[key].participants.push(participant);
    return acc;
  }, {} as Record<string, { className: string; classTime: string; participants: Participant[] }>);

  return (
    <Card className="border-l-4 border-l-brand-blue sticky top-4">
      <CardHeader>
        <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participants Added ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.values(participantsByClass).map((classGroup, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <h4 className="font-agrandir text-lg text-brand-navy">{classGroup.className}</h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-poppins">{classGroup.classTime}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {classGroup.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between bg-white rounded p-3">
                  <div>
                    <span className="font-poppins font-medium">{participant.firstName}</span>
                    <span className="text-sm text-gray-600 ml-2 font-poppins">
                      {participant.age} years old
                    </span>
                    {participant.ageOverride && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2 font-poppins">
                        Age Override
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <Button
          onClick={onContinue}
          className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-poppins py-3"
          size="lg"
        >
          Continue to Confirmation
        </Button>
      </CardContent>
    </Card>
  );
};

export default ParticipantsSummary;
