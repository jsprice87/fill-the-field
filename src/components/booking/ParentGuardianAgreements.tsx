
import React from 'react';
import { Button, Text, Checkbox, Stack, Group } from '@mantine/core';

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
    <div className="border-t pt-4">
      <Stack spacing="md">
        <Group align="flex-start" spacing="xs">
          <Checkbox
            id="waiver"
            checked={waiverAccepted}
            onChange={(event) => onWaiverChange(event.currentTarget.checked)}
            style={{ flexShrink: 0 }}
          />
          <Text className="font-poppins text-sm leading-relaxed" style={{ flex: 1, marginTop: '1px' }}>
            <span className="text-red-500">*</span> I agree to the terms and conditions outlined in the{' '}
            <Button 
              variant="subtle" 
              className="p-0 h-auto text-brand-blue underline font-poppins text-sm"
              onClick={onOpenWaiver}
              styles={{
                root: {
                  padding: 0,
                  height: 'auto',
                  minHeight: 'auto'
                }
              }}
            >
              liability waiver and agreement
            </Button>
          </Text>
        </Group>

        <Group align="flex-start" spacing="xs">
          <Checkbox
            id="communication"
            checked={communicationPermission}
            onChange={(event) => onCommunicationPermissionChange(event.currentTarget.checked)}
            style={{ flexShrink: 0 }}
          />
          <Text className="font-poppins text-sm leading-relaxed" style={{ flex: 1, marginTop: '1px' }}>
            <span className="text-red-500">*</span> I give permission to be contacted via email, SMS, and phone regarding important updates about classes such as cancellations, weather delays, and schedule changes.
          </Text>
        </Group>

        <Group align="flex-start" spacing="xs">
          <Checkbox
            id="marketing"
            checked={marketingPermission}
            onChange={(event) => onMarketingPermissionChange(event.currentTarget.checked)}
            style={{ flexShrink: 0 }}
          />
          <Text className="font-poppins text-sm leading-relaxed" style={{ flex: 1, marginTop: '1px' }}>
            I would like to receive marketing information and updates about upcoming promotions and special offers.
          </Text>
        </Group>
      </Stack>
    </div>
  );
};
