import React, { useState, useEffect } from 'react';
import { Card, Button, Stack, Group, Flex, Title, Text } from '@mantine/core';
import { TextInput } from '@/components/mantine/TextInput';
import { Building, Phone, MapPin } from 'lucide-react';
import { useFranchiseeProfile, useUpdateFranchiseeProfile } from '@/hooks/useFranchiseeProfile';

const BusinessInformationCard: React.FC = () => {
  const { data: profile, isLoading } = useFranchiseeProfile();
  const updateProfile = useUpdateFranchiseeProfile();
  
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        contact_name: profile.contact_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zip || ''
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Section p="xl">
          <Stack gap="md">
            <div style={{ height: 16, backgroundColor: '#e9ecef', borderRadius: 4, width: '33%' }}></div>
            <Stack gap="xs">
              <div style={{ height: 40, backgroundColor: '#e9ecef', borderRadius: 4 }}></div>
              <div style={{ height: 40, backgroundColor: '#e9ecef', borderRadius: 4 }}></div>
            </Stack>
          </Stack>
        </Card.Section>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Section withBorder>
        <Flex align="center" gap="sm" p="md">
          <Building size={20} />
          <Title order={3}>Business Information</Title>
        </Flex>
      </Card.Section>
      <Card.Section p="md">
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Company Name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
            <TextInput
              label="Contact Name"
              value={formData.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Business Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <TextInput
              label={
                <Flex align="center" gap={4}>
                  <Phone size={16} />
                  <span>Business Phone</span>
                </Flex>
              }
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Group>

          <TextInput
            label={
              <Flex align="center" gap={4}>
                <MapPin size={16} />
                <span>Business Address</span>
              </Flex>
            }
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />

          <Group grow>
            <TextInput
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
            <TextInput
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
            <TextInput
              label="ZIP Code"
              value={formData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
            />
          </Group>

          <Flex justify="flex-end">
            <Button 
              onClick={handleSave}
              loading={updateProfile.isPending}
            >
              Save Business Information
            </Button>
          </Flex>

          <Card bg="blue.0" p="md">
            <Title order={4} c="blue.9" mb="xs">Usage:</Title>
            <Text size="sm" c="blue.8">
              • Business phone and address appear on landing pages and booking confirmations
              <br />
              • Contact information is displayed in "Contact Us" sections
              <br />
              • Company name appears throughout the booking experience
            </Text>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default BusinessInformationCard;
