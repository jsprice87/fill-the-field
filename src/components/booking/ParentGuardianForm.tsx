
import React, { useEffect, useState } from 'react';
import { Card, Stack, Group, Text, Title, Button, Grid, TextInput, Select, Radio, Checkbox } from '@mantine/core';
import { User, Phone, Mail, MapPin, Users, FileText, MessageSquare, Heart } from 'lucide-react';
import { useFranchiseeWaiver } from '@/hooks/useFranchiseeWaiver';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';
import { WaiverModal } from './WaiverModal';
import type { BookingFlowData } from '@/hooks/useBookingFlow';

interface ParentGuardianFormProps {
  flowData: BookingFlowData;
  updateFlow: (updates: Partial<BookingFlowData>) => Promise<void>;
}

const ParentGuardianForm: React.FC<ParentGuardianFormProps> = ({ flowData, updateFlow }) => {
  const { waiverText, franchiseeData } = useFranchiseeWaiver(flowData);
  const { data: settings } = useFranchiseeSettings();
  const parentInfo = flowData.parentGuardianInfo || {};
  const [waiverModalOpened, setWaiverModalOpened] = useState(false);
  
  // Check if language information is required (default to true if setting doesn't exist)
  const requireLanguageInfo = settings?.require_language_info !== 'false';

  // Pre-populate parent info with lead data if parent info is empty but lead data exists
  useEffect(() => {
    if (flowData.leadData && 
        (!flowData.parentGuardianInfo || Object.keys(flowData.parentGuardianInfo).length === 0)) {
      const leadData = flowData.leadData;
      updateFlow({
        parentGuardianInfo: {
          firstName: leadData.firstName || '',
          lastName: leadData.lastName || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          zip: leadData.zip || ''
        }
      });
    }
  }, [flowData.leadData, flowData.parentGuardianInfo, updateFlow]);

  const handleFieldChange = async (field: string, value: string) => {
    await updateFlow({
      parentGuardianInfo: {
        ...parentInfo,
        [field]: value
      }
    });
  };

  const handleAgreementChange = async (field: keyof BookingFlowData, value: boolean) => {
    await updateFlow({ [field]: value });
  };

  return (
    <Stack spacing="lg">
      {/* Parent/Guardian Information */}
      <Card 
        className="border-l-4 border-l-brand-blue"
        padding="lg"
        radius="md"
        withBorder
      >
        <Group spacing="xs" mb="lg">
          <User className="h-5 w-5" />
          <Title order={3} className="font-agrandir text-xl text-brand-navy">
            Parent/Guardian Information
          </Title>
        </Group>

        <Stack spacing="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                id="firstName"
                label={
                  <Group spacing="xs">
                    <User className="h-4 w-4" />
                    <Text className="font-poppins text-sm font-medium text-gray-700">First Name</Text>
                  </Group>
                }
                value={parentInfo.firstName || ''}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="font-poppins"
                required
                size="md"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                id="lastName"
                label={
                  <Group spacing="xs">
                    <User className="h-4 w-4" />
                    <Text className="font-poppins text-sm font-medium text-gray-700">Last Name</Text>
                  </Group>
                }
                value={parentInfo.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="font-poppins"
                required
                size="md"
              />
            </Grid.Col>
          </Grid>

          <TextInput
            id="email"
            type="email"
            label={
              <Group spacing="xs">
                <Mail className="h-4 w-4" />
                <Text className="font-poppins text-sm font-medium text-gray-700">Email Address</Text>
              </Group>
            }
            value={parentInfo.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="Enter email address"
            className="font-poppins"
            required
            size="md"
          />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                id="phone"
                type="tel"
                label={
                  <Group spacing="xs">
                    <Phone className="h-4 w-4" />
                    <Text className="font-poppins text-sm font-medium text-gray-700">Phone Number</Text>
                  </Group>
                }
                value={parentInfo.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="(000) 000-0000"
                className="font-poppins"
                required
                size="md"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                id="zip"
                label={
                  <Group spacing="xs">
                    <MapPin className="h-4 w-4" />
                    <Text className="font-poppins text-sm font-medium text-gray-700">ZIP Code</Text>
                  </Group>
                }
                value={parentInfo.zip || ''}
                onChange={(e) => handleFieldChange('zip', e.target.value)}
                placeholder="12345"
                className="font-poppins"
                required
                size="md"
              />
            </Grid.Col>
          </Grid>

          <Select
            label={
              <Group spacing="xs">
                <Users className="h-4 w-4" />
                <Text className="font-poppins text-sm font-medium text-gray-700">Relationship to Child</Text>
              </Group>
            }
            value={parentInfo.relationship || ''}
            onChange={(value) => handleFieldChange('relationship', value)}
            placeholder="Select relationship"
            data={[
              { value: 'Parent', label: 'Parent' },
              { value: 'Guardian', label: 'Legal Guardian' },
              { value: 'Grandparent', label: 'Grandparent' },
              { value: 'Aunt/Uncle', label: 'Aunt/Uncle' },
              { value: 'Other', label: 'Other' }
            ]}
            className="font-poppins"
            withinPortal
            required
            size="md"
          />
        </Stack>
      </Card>

      {/* Required Agreements */}
      <Card 
        className="border-l-4 border-l-green-500"
        padding="lg"
        radius="md"
        withBorder
      >
        <Group spacing="xs" mb="lg">
          <FileText className="h-5 w-5" />
          <Title order={3} className="font-agrandir text-xl text-brand-navy">
            Waiver and Communication Agreements
          </Title>
        </Group>

        <Stack spacing="md">
          <Group align="flex-start" spacing="xs">
            <Checkbox
              id="waiver"
              checked={flowData.waiverAccepted || false}
              onChange={(event) => handleAgreementChange('waiverAccepted', event.currentTarget.checked)}
              style={{ flexShrink: 0 }}
            />
            <FileText className="h-4 w-4" style={{ flexShrink: 0, marginTop: '1px' }} />
            <Text className="font-poppins text-sm cursor-pointer" style={{ flex: 1, marginTop: '1px' }}>
              I agree to the{' '}
              <Text 
                component="button"
                className="text-brand-blue hover:text-brand-blue/80 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                onClick={() => setWaiverModalOpened(true)}
              >
                liability waiver and agreement
              </Text>
              . *
            </Text>
          </Group>

          <Group align="flex-start" spacing="xs">
            <Checkbox
              id="communication"
              checked={flowData.communicationPermission || false}
              onChange={(event) => handleAgreementChange('communicationPermission', event.currentTarget.checked)}
              style={{ flexShrink: 0 }}
            />
            <MessageSquare className="h-4 w-4" style={{ flexShrink: 0, marginTop: '1px' }} />
            <Text className="font-poppins text-sm" style={{ flex: 1, marginTop: '1px' }}>
              I agree to receive communication about my child's soccer classes and important updates. *
            </Text>
          </Group>

          <Group align="flex-start" spacing="xs">
            <Checkbox
              id="marketing"
              checked={flowData.marketingPermission || false}
              onChange={(event) => handleAgreementChange('marketingPermission', event.currentTarget.checked)}
              style={{ flexShrink: 0 }}
            />
            <Heart className="h-4 w-4" style={{ flexShrink: 0, marginTop: '1px' }} />
            <Text className="font-poppins text-sm" style={{ flex: 1, marginTop: '1px' }}>
              I would like to receive promotional offers and news about Soccer Stars programs (optional).
            </Text>
          </Group>
        </Stack>
      </Card>

      {/* Child Language - Conditional based on settings */}
      {requireLanguageInfo && (
        <Card 
          className="border-l-4 border-l-blue-400"
          padding="lg"
          radius="md"
          withBorder
        >
          <Title order={3} className="font-agrandir text-xl text-brand-navy" mb="lg">
            Language Information
          </Title>
          
          <Stack spacing="md">
            <Text className="font-poppins text-sm font-medium text-gray-700">
              Does your child speak English fluently?
            </Text>
            <Radio.Group
              value={flowData.childSpeaksEnglish === true ? 'yes' : flowData.childSpeaksEnglish === false ? 'no' : ''}
              onChange={(value) => handleAgreementChange('childSpeaksEnglish', value === 'yes')}
            >
              <Stack spacing="xs">
                <Radio value="yes" label="Yes" className="font-poppins" />
                <Radio value="no" label="No" className="font-poppins" />
              </Stack>
            </Radio.Group>
          </Stack>
        </Card>
      )}

      {/* Waiver Modal */}
      <WaiverModal
        opened={waiverModalOpened}
        onClose={() => setWaiverModalOpened(false)}
        waiverText={waiverText}
        franchiseeData={franchiseeData}
      />
    </Stack>
  );
};

export default ParentGuardianForm;
