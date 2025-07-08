import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Title, Group, Stack, PasswordInput } from '@mantine/core';
import { User, Mail, Building, Phone, MapPin, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeProfile, useUpdateFranchiseeProfile } from '@/hooks/useFranchiseeProfile';

interface ProfileData {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

const Profile: React.FC = () => {
  const { data: profile, isLoading, error } = useFranchiseeProfile();
  const updateProfile = useUpdateFranchiseeProfile();
  
  const [formData, setFormData] = useState<ProfileData>({
    company_name: null,
    contact_name: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    zip: null,
  });
  
  // Password management state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || null,
        contact_name: profile.contact_name || null,
        email: profile.email || null,
        phone: profile.phone || null,
        address: profile.address || null,
        city: profile.city || null,
        state: profile.state || null,
        zip: profile.zip || null,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        // Provide more meaningful error messages
        let errorMessage = 'Failed to change password';
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Current password is incorrect';
        } else if (error.message?.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long';
        } else if (error.message?.includes('too short')) {
          errorMessage = 'Password is too short - minimum 6 characters required';
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        return;
      }

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Password update failed - please try again');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Stack spacing="lg">
        {/* Business Information Card */}
        <Card padding="lg" withBorder>
          <Group mb="md">
            <User className="h-5 w-5" />
            <Title order={3}>Business Information</Title>
          </Group>
          
          <Stack spacing="md">
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput
                label="Company Name"
                name="company_name"
                value={formData.company_name || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="Contact Name"
                name="contact_name"
                value={formData.contact_name || ''}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <TextInput
              label="Address"
              name="address"
              value={formData.address || ''}
              onChange={(e) => handleChange(e)}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <TextInput
                label="City"
                name="city"
                value={formData.city || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="State"
                name="state"
                value={formData.state || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="ZIP Code"
                name="zip"
                value={formData.zip || ''}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <Button onClick={handleSave} disabled={updateProfile.isPending} loading={updateProfile.isPending}>
              Save Changes
            </Button>
          </Stack>
        </Card>

        {/* Password Management Card */}
        <Card padding="lg" withBorder>
          <Group mb="md">
            <Lock className="h-5 w-5" />
            <Title order={3}>Password Management</Title>
          </Group>
          
          <Stack spacing="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            
            <PasswordInput
              label="New Password"
              placeholder="Enter new password (minimum 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button 
              onClick={handlePasswordChange} 
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              loading={isChangingPassword}
              variant="outline"
            >
              Change Password
            </Button>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
};

export default Profile;
