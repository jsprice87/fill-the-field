
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, X, Calendar, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ParentGuardianForm from './ParentGuardianForm';
import { useBookingFlow } from '@/hooks/useBookingFlow';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  classScheduleId: string;
  className: string;
  classTime: string;
  selectedDate: string;
  healthConditions?: string;
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
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow');
  const { flowData } = useBookingFlow(flowId || undefined);

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

  const canContinue = () => {
    console.log('=== DEBUGGING CONTINUE BUTTON ===');
    console.log('flowData:', flowData);
    console.log('participants:', participants);
    
    // Check if we have participants
    if (participants.length === 0) {
      console.log('❌ No participants found');
      return false;
    }
    console.log('✅ Participants found:', participants.length);

    // Check if parent/guardian info is complete
    const parentInfo = flowData.parentGuardianInfo;
    console.log('parentInfo:', parentInfo);
    
    const hasCompleteParentInfo = parentInfo && 
      parentInfo.firstName && 
      parentInfo.firstName.trim() !== '' &&
      parentInfo.lastName && 
      parentInfo.lastName.trim() !== '' &&
      parentInfo.email && 
      parentInfo.email.trim() !== '' &&
      parentInfo.phone && 
      parentInfo.phone.trim() !== '' &&
      parentInfo.zip && 
      parentInfo.zip.trim() !== '';
    
    console.log('hasCompleteParentInfo:', hasCompleteParentInfo);
    console.log('parentInfo fields check:', {
      firstName: parentInfo?.firstName,
      lastName: parentInfo?.lastName,
      email: parentInfo?.email,
      phone: parentInfo?.phone,
      zip: parentInfo?.zip
    });
    
    if (!hasCompleteParentInfo) {
      console.log('❌ Parent info incomplete');
      return false;
    }
    console.log('✅ Parent info complete');

    // Check if waiver is accepted (MANDATORY)
    console.log('waiverAccepted:', flowData.waiverAccepted);
    if (!flowData.waiverAccepted) {
      console.log('❌ Waiver not accepted');
      return false;
    }
    console.log('✅ Waiver accepted');

    // Check if communication permission is granted (MANDATORY)
    console.log('communicationPermission:', flowData.communicationPermission);
    if (!flowData.communicationPermission) {
      console.log('❌ Communication permission not granted');
      return false;
    }
    console.log('✅ Communication permission granted');

    console.log('✅ All requirements met, can continue');
    return true;
  };

  const getMissingRequirements = () => {
    const missing = [];
    
    if (participants.length === 0) {
      missing.push('Add at least one participant');
    }
    
    const parentInfo = flowData.parentGuardianInfo;
    const hasCompleteParentInfo = parentInfo && 
      parentInfo.firstName && 
      parentInfo.firstName.trim() !== '' &&
      parentInfo.lastName && 
      parentInfo.lastName.trim() !== '' &&
      parentInfo.email && 
      parentInfo.email.trim() !== '' &&
      parentInfo.phone && 
      parentInfo.phone.trim() !== '' &&
      parentInfo.zip && 
      parentInfo.zip.trim() !== '';
    
    if (!hasCompleteParentInfo) {
      missing.push('Complete all required parent/guardian information fields');
    }
    
    if (!flowData.waiverAccepted) {
      missing.push('Accept the liability waiver');
    }
    
    if (!flowData.communicationPermission) {
      missing.push('Grant communication permission');
    }
    
    return missing;
  };

  const buttonEnabled = canContinue();
  const missingRequirements = getMissingRequirements();

  console.log('Button render state:', { buttonEnabled, missingRequirements });

  return (
    <div className="space-y-6">
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-poppins font-medium">
                          {participant.firstName} {participant.lastName}
                        </span>
                        <span className="text-sm text-gray-600 font-poppins">
                          {participant.age} years old
                        </span>
                        {participant.ageOverride && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-poppins">
                            Age Override
                          </span>
                        )}
                      </div>
                      {participant.healthConditions && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500 font-poppins">Health info: </span>
                          <span className="text-xs text-gray-700 font-poppins">{participant.healthConditions}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveParticipant(participant.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ParentGuardianForm />

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <Button
            onClick={onContinue}
            disabled={!buttonEnabled}
            className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-poppins py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
            size="lg"
          >
            {buttonEnabled ? 'Continue to Confirmation' : 'Complete Required Information'}
          </Button>
          {!buttonEnabled && (
            <div className="mt-3">
              <p className="text-center text-sm text-gray-600 mb-2 font-poppins">
                Please complete the following required items:
              </p>
              <ul className="text-center text-sm text-red-600 space-y-1">
                {missingRequirements.map((requirement, index) => (
                  <li key={index} className="font-poppins">• {requirement}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Debug info - remove this after testing */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <div>Debug: Button enabled = {buttonEnabled.toString()}</div>
            <div>Missing: {missingRequirements.join(', ')}</div>
            <div>Waiver: {flowData.waiverAccepted?.toString()}</div>
            <div>Communication: {flowData.communicationPermission?.toString()}</div>
            <div>Parent Info: {JSON.stringify(flowData.parentGuardianInfo)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsSummary;
