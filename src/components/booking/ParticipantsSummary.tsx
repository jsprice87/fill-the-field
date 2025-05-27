
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, X, Calendar, Clock } from 'lucide-react';
import ParentGuardianForm from './ParentGuardianForm';
import { BookingFlowData } from '@/hooks/useBookingFlow';

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
  flowData: BookingFlowData;
}

const ParticipantsSummary: React.FC<ParticipantsSummaryProps> = ({
  participants,
  onRemoveParticipant,
  onContinue,
  flowData
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

  // Validation logic - check if all required fields are completed
  const parentInfo = flowData.parentGuardianInfo;
  
  // Check if all parent info fields are filled
  const isParentInfoComplete = !!(
    parentInfo?.firstName?.trim() &&
    parentInfo?.lastName?.trim() &&
    parentInfo?.email?.trim() &&
    parentInfo?.phone?.trim() &&
    parentInfo?.zip?.trim()
  );

  // Check required agreements
  const isWaiverAccepted = !!flowData.waiverAccepted;
  const isCommunicationPermissionGranted = !!flowData.communicationPermission;

  // Overall validation
  const canContinue = () => {
    console.log('=== VALIDATION CHECK (ParticipantsSummary) ===');
    console.log('Participants count:', participants.length);
    console.log('Parent info complete:', isParentInfoComplete);
    console.log('Waiver accepted:', isWaiverAccepted);
    console.log('Communication permission:', isCommunicationPermissionGranted);
    console.log('Parent info data:', parentInfo);
    
    if (participants.length === 0) {
      console.log('❌ No participants');
      return false;
    }
    
    if (!isParentInfoComplete) {
      console.log('❌ Parent info incomplete');
      return false;
    }
    
    if (!isWaiverAccepted) {
      console.log('❌ Waiver not accepted');
      return false;
    }
    
    if (!isCommunicationPermissionGranted) {
      console.log('❌ Communication permission not granted');
      return false;
    }
    
    console.log('✅ All requirements met');
    return true;
  };

  const getMissingRequirements = () => {
    const missing = [];
    
    if (participants.length === 0) {
      missing.push('Add at least one participant');
    }
    
    if (!isParentInfoComplete) {
      missing.push('Complete all required parent/guardian information fields');
    }
    
    if (!isWaiverAccepted) {
      missing.push('Accept the liability waiver');
    }
    
    if (!isCommunicationPermissionGranted) {
      missing.push('Grant communication permission');
    }
    
    return missing;
  };

  const buttonEnabled = canContinue();
  const missingRequirements = getMissingRequirements();

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
          
          {/* Debug info */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <div className="font-semibold mb-2">ParticipantsSummary Debug:</div>
            <div>Button enabled: {buttonEnabled.toString()}</div>
            <div>Missing: {missingRequirements.join(', ')}</div>
            <div>Form Complete: {isParentInfoComplete.toString()}</div>
            <div>Waiver: {isWaiverAccepted.toString()}</div>
            <div>Communication: {isCommunicationPermissionGranted.toString()}</div>
            <div>Parent Info Fields:</div>
            <div className="ml-2">
              <div>firstName: "{parentInfo?.firstName || 'empty'}"</div>
              <div>lastName: "{parentInfo?.lastName || 'empty'}"</div>
              <div>email: "{parentInfo?.email || 'empty'}"</div>
              <div>phone: "{parentInfo?.phone || 'empty'}"</div>
              <div>zip: "{parentInfo?.zip || 'empty'}"</div>
            </div>
            <div>Flow Data Keys: {Object.keys(flowData).join(', ')}</div>
            <div>FlowData parentGuardianInfo: {JSON.stringify(flowData.parentGuardianInfo)}</div>
            <div>FlowData waiverAccepted: {JSON.stringify(flowData.waiverAccepted)}</div>
            <div>FlowData communicationPermission: {JSON.stringify(flowData.communicationPermission)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsSummary;
