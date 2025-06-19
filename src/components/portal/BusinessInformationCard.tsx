
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@mantine/core';
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
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Business Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contact-name">Contact Name</Label>
            <Input
              id="contact-name"
              value={formData.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-email">Business Email</Label>
            <Input
              id="business-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="business-phone" className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Business Phone
            </Label>
            <Input
              id="business-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="business-address" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Business Address
          </Label>
          <Input
            id="business-address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="business-city">City</Label>
            <Input
              id="business-city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="business-state">State</Label>
            <Input
              id="business-state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="business-zip">ZIP Code</Label>
            <Input
              id="business-zip"
              value={formData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Business Information'}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Usage:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Business phone and address appear on landing pages and booking confirmations</li>
            <li>• Contact information is displayed in "Contact Us" sections</li>
            <li>• Company name appears throughout the booking experience</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInformationCard;
