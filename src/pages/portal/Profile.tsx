import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Building, Mail, Phone, MapPin, Save } from 'lucide-react';
import { PortalShell } from '@/layout/PortalShell';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import { useUpdateFranchiseeData } from '@/hooks/useUpdateFranchiseeData';

const PortalProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data: franchiseeData } = useFranchiseeData();
  const updateFranchisee = useUpdateFranchiseeData();

  useEffect(() => {
    if (franchiseeData) {
      setCompanyName(franchiseeData.business_name || '');
      setContactName(franchiseeData.contact_name || '');
      setEmail(franchiseeData.email || '');
      setPhone(franchiseeData.phone || '');
      setAddress(franchiseeData.address || '');
      setCity(franchiseeData.city || '');
      setState(franchiseeData.state || '');
      setZip(franchiseeData.zip || '');
      setIsLoading(false);
    }
  }, [franchiseeData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await updateFranchisee.mutateAsync({
        business_name: companyName,
        contact_name: contactName,
        email: email,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zip: zip,
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (franchiseeData) {
      setCompanyName(franchiseeData.business_name || '');
      setContactName(franchiseeData.contact_name || '');
      setEmail(franchiseeData.email || '');
      setPhone(franchiseeData.phone || '');
      setAddress(franchiseeData.address || '');
      setCity(franchiseeData.city || '');
      setState(franchiseeData.state || '');
      setZip(franchiseeData.zip || '');
    }
  };

  if (isLoading) {
    return (
      <PortalShell>
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button onClick={handleSaveClick} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={handleEditClick}>Edit Profile</Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Franchisee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Label htmlFor="company-name">
                <Building className="mr-2 h-4 w-4 inline-block" />
                Company Name
              </Label>
              <TextInput
                id="company-name"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={!isEditing}
                leftSection={<Building className="h-4 w-4" />}
              />
            </div>
            <div className="grid gap-4">
              <Label htmlFor="contact-name">
                <User className="mr-2 h-4 w-4 inline-block" />
                Contact Name
              </Label>
              <TextInput
                id="contact-name"
                placeholder="Enter contact name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                disabled={!isEditing}
                leftSection={<User className="h-4 w-4" />}
              />
            </div>
            <div className="grid gap-4">
              <Label htmlFor="email">
                <Mail className="mr-2 h-4 w-4 inline-block" />
                Email Address
              </Label>
              <TextInput
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                leftSection={<Mail className="h-4 w-4" />}
              />
            </div>
            <div className="grid gap-4">
              <Label htmlFor="phone">
                <Phone className="mr-2 h-4 w-4 inline-block" />
                Phone Number
              </Label>
              <TextInput
                id="phone"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                leftSection={<Phone className="h-4 w-4" />}
              />
            </div>
            <div className="grid gap-4">
              <Label htmlFor="address">
                <MapPin className="mr-2 h-4 w-4 inline-block" />
                Address
              </Label>
              <TextInput
                id="address"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
                leftSection={<MapPin className="h-4 w-4" />}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 grid gap-4">
                <Label htmlFor="city">City</Label>
                <TextInput
                  id="city"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="col-span-1 grid gap-4">
                <Label htmlFor="state">State</Label>
                <TextInput
                  id="state"
                  placeholder="Enter state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="col-span-1 grid gap-4">
                <Label htmlFor="zip">Zip Code</Label>
                <TextInput
                  id="zip"
                  placeholder="Enter zip code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
};

export default PortalProfile;
