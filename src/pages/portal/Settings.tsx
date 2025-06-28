import React, { useState, useEffect } from 'react';
import { Card, Stack, Group, Flex, Title, Text, Textarea, Checkbox } from '@mantine/core';
import { Globe, Share2, Mail } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import { TextInput } from '@/components/mantine/TextInput';
import BookingRestrictionsCard from '@/components/portal/BookingRestrictionsCard';
import TimezoneSettingsCard from '@/components/portal/TimezoneSettingsCard';
import BusinessInformationCard from '@/components/portal/BusinessInformationCard';
import CustomWaiverCard from '@/components/portal/CustomWaiverCard';
import MetaPixelCard from '@/components/portal/MetaPixelCard';
import WebhookIntegrationsCard from '@/components/portal/WebhookIntegrationsCard';

const Settings: React.FC = () => {
  const { data: settings, isLoading } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  // Local state for website and social media fields to prevent constant DB updates
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [shareMessageTemplate, setShareMessageTemplate] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [requireLanguageInfo, setRequireLanguageInfo] = useState(true);

  // Initialize local state when settings load
  useEffect(() => {
    if (settings) {
      setWebsiteUrl(settings.website_url || '');
      setFacebookUrl(settings.facebook_url || '');
      setInstagramUrl(settings.instagram_url || '');
      setShareMessageTemplate(settings.share_message_template || '');
      setCcEmails(settings.cc_emails || '');
      setRequireLanguageInfo(settings.require_language_info === 'true' || settings.require_language_info === undefined);
    }
  }, [settings]);

  const handleSettingBlur = (key: string, value: string) => {
    // Only update if the value has actually changed
    if (settings?.[key] !== value) {
      updateSetting.mutate({ key, value });
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Stack gap="xl">
          <div style={{ height: 32, backgroundColor: '#e9ecef', borderRadius: 4, width: '33%' }}></div>
          <Stack gap="md">
            <div style={{ height: 128, backgroundColor: '#e9ecef', borderRadius: 4 }}></div>
            <div style={{ height: 128, backgroundColor: '#e9ecef', borderRadius: 4 }}></div>
          </Stack>
        </Stack>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Stack gap="xl">
        <div>
          <Title order={1} c="gray.9">Settings</Title>
          <Text c="gray.6" mt={4}>Configure your booking page and business settings</Text>
        </div>

        <Stack gap="xl">
          {/* Business Information */}
          <BusinessInformationCard />

          {/* Timezone Settings */}
          <TimezoneSettingsCard />

          {/* CC Emails Settings */}
          <Card>
            <Card.Section p="md">
              <Flex align="center" gap="sm">
                <Mail size={20} />
                <Title order={3}>CC Email Notifications</Title>
              </Flex>
            </Card.Section>
            <Card.Section p="md">
              <Stack gap="md">
                <div>
                  <TextInput
                    label="CC Email Addresses"
                    placeholder="email1@domain.com, email2@domain.com"
                    value={ccEmails}
                    onChange={(e) => setCcEmails(e.target.value)}
                    onBlur={(e) => handleSettingBlur('cc_emails', e.target.value)}
                    disabled={updateSetting.isPending}
                    description="Enter email addresses separated by commas. These emails will receive copies of booking confirmations and notifications."
                  />
                </div>
                
                <Stack gap="xs">
                  <Group gap="sm">
                    <Checkbox
                      id="require_language_info"
                      checked={requireLanguageInfo}
                      onChange={(event) => {
                        const newValue = event.currentTarget.checked;
                        setRequireLanguageInfo(newValue);
                        handleSettingBlur('require_language_info', newValue.toString());
                      }}
                      disabled={updateSetting.isPending}
                      label="Require language information from parents"
                    />
                  </Group>
                  <Text size="sm" c="dimmed">
                    When enabled, parents will be asked "Does your child speak English fluently?" during booking.
                  </Text>
                </Stack>
              </Stack>
            </Card.Section>
          </Card>

          {/* Website & Social Media Settings */}
          <Card>
            <Card.Section p="md">
              <Flex align="center" gap="sm">
                <Globe size={20} />
                <Title order={3}>Website & Social Media</Title>
              </Flex>
            </Card.Section>
            <Card.Section p="md">
              <Stack gap="md">
                <TextInput
                  label="Website URL"
                  placeholder="https://your-website.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onBlur={(e) => handleSettingBlur('website_url', e.target.value)}
                  disabled={updateSetting.isPending}
                />
                
                <TextInput
                  label="Facebook Page URL"
                  placeholder="https://facebook.com/your-page"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  onBlur={(e) => handleSettingBlur('facebook_url', e.target.value)}
                  disabled={updateSetting.isPending}
                />
                
                <TextInput
                  label="Instagram Profile URL"
                  placeholder="https://instagram.com/your-profile"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  onBlur={(e) => handleSettingBlur('instagram_url', e.target.value)}
                  disabled={updateSetting.isPending}
                />
              </Stack>
            </Card.Section>
          </Card>

          {/* Share Message Settings */}
          <Card>
            <Card.Section p="md">
              <Flex align="center" gap="sm">
                <Share2 size={20} />
                <Title order={3}>Share Message Template</Title>
              </Flex>
            </Card.Section>
            <Card.Section p="md">
              <div>
                <Textarea
                  label="Custom Share Message"
                  placeholder="I just signed up my child for a free soccer trial at {company_name}! Check it out: {url}"
                  value={shareMessageTemplate}
                  onChange={(e) => setShareMessageTemplate(e.target.value)}
                  onBlur={(e) => handleSettingBlur('share_message_template', e.target.value)}
                  disabled={updateSetting.isPending}
                  rows={3}
                  description='Use {"company_name"} and {"url"} as placeholders that will be automatically replaced.'
                />
              </div>
            </Card.Section>
          </Card>

          {/* Meta Pixel Tracking */}
          <MetaPixelCard />

          {/* Workflow Integrations */}
          <WebhookIntegrationsCard />

          {/* Custom Waiver */}
          <CustomWaiverCard />

          {/* Booking Restrictions */}
          <BookingRestrictionsCard />
        </Stack>
      </Stack>
    </div>
  );
};

export default Settings;
