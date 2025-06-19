
import React from 'react';
import { Button } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ParentGuardianAgreementsProps {
  waiverAccepted: boolean;
  communicationPermission: boolean;
  marketingPermission: boolean;
  onWaiverChange: (checked: boolean) => void;
  onCommunicationPermissionChange: (checked: boolean) => void;
  onMarketingPermissionChange: (checked: boolean) => void;
  onOpenWaiver: () => void;
}

export const ParentGuardianAgreements: React.FC<ParentGuardianAgreementsProps> = ({
  waiverAccepted,
  communicationPermission,
  marketingPermission,
  onWaiverChange,
  onCommunicationPermissionChange,
  onMarketingPermissionChange,
  onOpenWaiver
}) => {
  return (
    <div className="border-t pt-4 space-y-4">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="waiver"
          checked={waiverAccepted}
          onCheckedChange={onWaiverChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="waiver" className="font-poppins text-sm leading-relaxed">
            <span className="text-red-500">*</span> I agree to the terms and conditions outlined in the{' '}
            <Button 
              variant="subtle" 
              className="p-0 h-auto text-brand-blue underline font-poppins text-sm"
              onClick={onOpenWaiver}
            >
              liability waiver and agreement
            </Button>
          </Label>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="communication"
          checked={communicationPermission}
          onCheckedChange={onCommunicationPermissionChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="communication" className="font-poppins text-sm leading-relaxed">
            <span className="text-red-500">*</span> I give permission to be contacted via email, SMS, and phone regarding important updates about classes such as cancellations, weather delays, and schedule changes.
          </Label>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="marketing"
          checked={marketingPermission}
          onCheckedChange={onMarketingPermissionChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="marketing" className="font-poppins text-sm leading-relaxed">
            I would like to receive marketing information and updates about upcoming promotions and special offers.
          </Label>
        </div>
      </div>
    </div>
  );
};
