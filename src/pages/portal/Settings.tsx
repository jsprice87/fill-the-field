
import React, { useState, useEffect } from 'react';
import { Card } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe, Share2, Mail } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
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
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your booking page and business settings</p>
      </div>

      <div className="grid gap-6">
        {/* Business Information */}
        <BusinessInformationCard />

        {/* Timezone Settings */}
        <TimezoneSettingsCard />

        {/* CC Emails Settings */}
        <Card>
          <Card.Section className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              CC Email Notifications
            </div>
          </Card.Section>
          <Card.Section className="p-4">
            <div>
              <Label htmlFor="cc_emails">CC Email Addresses</Label>
              <Input
                id="cc_emails"
                placeholder="email1@domain.com, email2@domain.com"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                onBlur={(e) => handleSettingBlur('cc_emails', e.target.value)}
                disabled={updateSetting.isPending}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter email addresses separated by commas. These emails will receive copies of booking confirmations and notifications.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="require_language_info"
                  checked={requireLanguageInfo}
                  onCheckedChange={(checked) => {
                    const newValue = checked === true;
                    setRequireLanguageInfo(newValue);
                    handleSettingBlur('require_language_info', newValue.toString());
                  }}
                  disabled={updateSetting.isPending}
                />
                <Label htmlFor="require_language_info" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Require language information from parents
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                When enabled, parents will be asked "Does your child speak English fluently?" during booking.
              </p>
            </div>
          </Card.Section>
        </Card>

        {/* Website & Social Media Settings */}
        <Card>
          <Card.Section className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website & Social Media
            </div>
          </Card.Section>
          <Card.Section className="space-y-4 p-4">
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                placeholder="https://your-website.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onBlur={(e) => handleSettingBlur('website_url', e.target.value)}
                disabled={updateSetting.isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="facebook_url">Facebook Page URL</Label>
              <Input
                id="facebook_url"
                placeholder="https://facebook.com/your-page"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                onBlur={(e) => handleSettingBlur('facebook_url', e.target.value)}
                disabled={updateSetting.isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="instagram_url">Instagram Profile URL</Label>
              <Input
                id="instagram_url"
                placeholder="https://instagram.com/your-profile"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                onBlur={(e) => handleSettingBlur('instagram_url', e.target.value)}
                disabled={updateSetting.isPending}
              />
            </div>
          </Card.Section>
        </Card>

        {/* Share Message Settings */}
        <Card>
          <Card.Section className="p-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Message Template
            </div>
          </Card.Section>
          <Card.Section className="p-4">
            <div>
              <Label htmlFor="share_message_template">Custom Share Message</Label>
              <Textarea
                id="share_message_template"
                placeholder="I just signed up my child for a free soccer trial at {company_name}! Check it out: {url}"
                value={shareMessageTemplate}
                onChange={(e) => setShareMessageTemplate(e.target.value)}
                onBlur={(e) => handleSettingBlur('share_message_template', e.target.value)}
                disabled={updateSetting.isPending}
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {"{company_name}"} and {"{url}"} as placeholders that will be automatically replaced.
              </p>
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
      </div>
    </div>
  );
};

export default Settings;
