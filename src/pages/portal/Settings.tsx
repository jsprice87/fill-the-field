import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Share2 } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import BookingRestrictionsCard from '@/components/portal/BookingRestrictionsCard';
import TimezoneSettingsCard from '@/components/portal/TimezoneSettingsCard';
import BusinessInformationCard from '@/components/portal/BusinessInformationCard';
import CustomWaiverCard from '@/components/portal/CustomWaiverCard';
import MetaPixelCard from '@/components/portal/MetaPixelCard';

const Settings: React.FC = () => {
  const { data: settings, isLoading } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  // Local state for website and social media fields to prevent constant DB updates
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [shareMessageTemplate, setShareMessageTemplate] = useState('');

  // Initialize local state when settings load
  useEffect(() => {
    if (settings) {
      setWebsiteUrl(settings.website_url || '');
      setFacebookUrl(settings.facebook_url || '');
      setInstagramUrl(settings.instagram_url || '');
      setShareMessageTemplate(settings.share_message_template || '');
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

        {/* Website & Social Media Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website & Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Share Message Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Message Template
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Meta Pixel Tracking */}
        <MetaPixelCard />

        {/* Custom Waiver */}
        <CustomWaiverCard />

        {/* Booking Restrictions */}
        <BookingRestrictionsCard />
      </div>
    </div>
  );
};

export default Settings;
