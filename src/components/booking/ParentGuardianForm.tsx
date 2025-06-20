import React, { useState, useEffect } from 'react';
import { Card } from '@mantine/core';
import { User } from 'lucide-react';
import type { BookingFlowData } from '@/hooks/useBookingFlow';
import { ParentGuardianFormFields } from './ParentGuardianFormFields';
import { ParentGuardianAgreements } from './ParentGuardianAgreements';
import { WaiverModal } from './WaiverModal';
import { useFranchiseeWaiver } from '@/hooks/useFranchiseeWaiver';

interface ParentGuardianFormProps {
  flowData: BookingFlowData;
  updateFlow: (updates: Partial<BookingFlowData>) => Promise<void>;
}

const ParentGuardianForm: React.FC<ParentGuardianFormProps> = ({ 
  flowData, 
  updateFlow 
}) => {
  const [waiverModalOpened, setWaiverModalOpened] = useState(false);
  const { franchiseeData, waiverText } = useFranchiseeWaiver(flowData);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: '',
    relationship: 'Parent'
  });

  // Pre-fill form with lead data on component mount
  useEffect(() => {
    console.log('ParentGuardianForm: Setting up form data', { flowData });
    
    const leadData = flowData.leadData;
    const parentInfo = flowData.parentGuardianInfo;
    
    const initialData = {
      firstName: parentInfo?.firstName || leadData?.firstName || '',
      lastName: parentInfo?.lastName || leadData?.lastName || '',
      email: parentInfo?.email || leadData?.email || '',
      phone: parentInfo?.phone || leadData?.phone || '',
      zip: parentInfo?.zip || leadData?.zip || '',
      relationship: parentInfo?.relationship || 'Parent'
    };
    
    console.log('ParentGuardianForm: Initial data set to:', initialData);
    setFormData(initialData);
    
    // If we have lead data and no existing parent info, update the flow immediately
    if (leadData && (!parentInfo?.firstName || !parentInfo?.email)) {
      console.log('ParentGuardianForm: Updating flow with lead data');
      updateParentGuardianInfo(initialData);
    }
  }, [flowData.leadData, flowData.parentGuardianInfo]);

  const updateParentGuardianInfo = async (info: any) => {
    console.log('🔄 Updating parent guardian info:', info);
    try {
      await updateFlow({ parentGuardianInfo: info });
      console.log('✅ Parent guardian info updated successfully');
    } catch (error) {
      console.error('❌ Error updating parent guardian info:', error);
    }
  };

  const updateWaiverAccepted = async (accepted: boolean) => {
    console.log('🔄 Updating waiver accepted:', accepted);
    try {
      await updateFlow({ waiverAccepted: accepted });
      console.log('✅ Waiver acceptance updated successfully');
    } catch (error) {
      console.error('❌ Error updating waiver acceptance:', error);
    }
  };

  const updateCommunicationPermission = async (permission: boolean) => {
    console.log('🔄 Updating communication permission:', permission);
    try {
      await updateFlow({ communicationPermission: permission });
      console.log('✅ Communication permission updated successfully');
    } catch (error) {
      console.error('❌ Error updating communication permission:', error);
    }
  };

  const updateMarketingPermission = async (permission: boolean) => {
    console.log('🔄 Updating marketing permission:', permission);
    try {
      await updateFlow({ marketingPermission: permission });
      console.log('✅ Marketing permission updated successfully');
    } catch (error) {
      console.error('❌ Error updating marketing permission:', error);
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    console.log(`📝 Input changed - ${field}:`, value);
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Immediately update the flow with the new data
    await updateParentGuardianInfo(newFormData);
  };

  const handleWaiverChange = async (checked: boolean) => {
    console.log('☑️ Waiver checkbox changed:', checked);
    await updateWaiverAccepted(checked);
  };

  const handleCommunicationPermissionChange = async (checked: boolean) => {
    console.log('📞 Communication permission changed:', checked);
    await updateCommunicationPermission(checked);
  };

  const handleMarketingPermissionChange = async (checked: boolean) => {
    console.log('📧 Marketing permission changed:', checked);
    await updateMarketingPermission(checked);
  };

  const isFormComplete = formData.firstName && formData.lastName && formData.email && formData.phone && formData.zip;

  // Debug log to see current flow state
  console.log('Current flow data in ParentGuardianForm:', {
    waiverAccepted: flowData.waiverAccepted,
    communicationPermission: flowData.communicationPermission,
    marketingPermission: flowData.marketingPermission,
    parentGuardianInfo: flowData.parentGuardianInfo,
    formData
  });

  return (
    <Card className="border-l-4 border-l-brand-red">
      <Card.Section>
        <Card.Section className="font-agrandir text-xl text-brand-navy flex items-center gap-2 p-4 border-b">
          <User className="h-5 w-5" />
          Parent/Guardian Information
        </Card.Section>
      </Card.Section>
      <Card.Section className="space-y-4 p-4">
        <ParentGuardianFormFields
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ParentGuardianAgreements
          waiverAccepted={flowData.waiverAccepted || false}
          communicationPermission={flowData.communicationPermission || false}
          marketingPermission={flowData.marketingPermission || false}
          onWaiverChange={handleWaiverChange}
          onCommunicationPermissionChange={handleCommunicationPermissionChange}
          onMarketingPermissionChange={handleMarketingPermissionChange}
          onOpenWaiver={() => setWaiverModalOpened(true)}
        />

        {!isFormComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-poppins">
              Please complete all required parent/guardian information above.
            </p>
          </div>
        )}

        {(!flowData.waiverAccepted || !flowData.communicationPermission) && isFormComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-poppins">
              Please accept the required agreements to continue.
            </p>
          </div>
        )}

        <WaiverModal
          opened={waiverModalOpened}
          onClose={() => setWaiverModalOpened(false)}
          waiverText={waiverText}
          franchiseeData={franchiseeData}
        />
      </Card.Section>
    </Card>
  );
};

export default ParentGuardianForm;
