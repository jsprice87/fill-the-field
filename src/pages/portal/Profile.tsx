import React, { useState, useEffect } from 'react';
import { Card, Button, TextInput, Title, Group, Stack, PasswordInput } from '@mantine/core';
import { User, Mail, Building, Phone, MapPin, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [profile, setProfile] = useState<ProfileData>({
    company_name: null,
    contact_name: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    zip: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Password management state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Authentication required");
        return;
      }

      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Authentication required");
        return;
      }

      const { error } = await supabase
        .from('franchisees')
        .update(profile)
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
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
                value={profile.company_name || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="Contact Name"
                name="contact_name"
                value={profile.contact_name || ''}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="Phone"
                name="phone"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <TextInput
              label="Address"
              name="address"
              value={profile.address || ''}
              onChange={(e) => handleChange(e)}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <TextInput
                label="City"
                name="city"
                value={profile.city || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="State"
                name="state"
                value={profile.state || ''}
                onChange={(e) => handleChange(e)}
              />
              <TextInput
                label="ZIP Code"
                name="zip"
                value={profile.zip || ''}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} loading={isSaving}>
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
