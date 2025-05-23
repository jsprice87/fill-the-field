
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, Loader2 } from 'lucide-react';
import { useFranchiseeData, useUpdateFranchiseeData } from '@/hooks/useFranchiseeData';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';

const Settings: React.FC = () => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  const { data: franchiseeData, isLoading: isLoadingData } = useFranchiseeData();
  const { data: settings, isLoading: isLoadingSettings } = useFranchiseeSettings();
  const updateFranchiseeData = useUpdateFranchiseeData();
  const updateSetting = useUpdateFranchiseeSetting();

  const businessForm = useForm({
    defaultValues: {
      company_name: franchiseeData?.company_name || '',
      contact_name: franchiseeData?.contact_name || '',
      email: franchiseeData?.email || '',
      phone: franchiseeData?.phone || ''
    }
  });

  const addressForm = useForm({
    defaultValues: {
      address: franchiseeData?.address || '',
      city: franchiseeData?.city || '',
      state: franchiseeData?.state || '',
      zip: franchiseeData?.zip || ''
    }
  });

  const waiverForm = useForm({
    defaultValues: {
      waiver_text: settings?.waiver_text || ''
    }
  });

  React.useEffect(() => {
    if (franchiseeData) {
      businessForm.reset({
        company_name: franchiseeData.company_name || '',
        contact_name: franchiseeData.contact_name || '',
        email: franchiseeData.email || '',
        phone: franchiseeData.phone || ''
      });
      addressForm.reset({
        address: franchiseeData.address || '',
        city: franchiseeData.city || '',
        state: franchiseeData.state || '',
        zip: franchiseeData.zip || ''
      });
    }
  }, [franchiseeData, businessForm, addressForm]);

  React.useEffect(() => {
    if (settings) {
      waiverForm.reset({
        waiver_text: settings.waiver_text || ''
      });
    }
  }, [settings, waiverForm]);

  const handleEditClick = (section: string) => {
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    // Reset forms to original values
    if (franchiseeData) {
      businessForm.reset({
        company_name: franchiseeData.company_name || '',
        contact_name: franchiseeData.contact_name || '',
        email: franchiseeData.email || '',
        phone: franchiseeData.phone || ''
      });
      addressForm.reset({
        address: franchiseeData.address || '',
        city: franchiseeData.city || '',
        state: franchiseeData.state || '',
        zip: franchiseeData.zip || ''
      });
    }
    if (settings) {
      waiverForm.reset({
        waiver_text: settings.waiver_text || ''
      });
    }
  };

  const handleBusinessSave = (data: any) => {
    updateFranchiseeData.mutate(data, {
      onSuccess: () => {
        setEditingSection(null);
      }
    });
  };

  const handleAddressSave = (data: any) => {
    updateFranchiseeData.mutate(data, {
      onSuccess: () => {
        setEditingSection(null);
      }
    });
  };

  const handleWaiverSave = (data: any) => {
    updateSetting.mutate({
      key: 'waiver_text',
      value: data.waiver_text
    }, {
      onSuccess: () => {
        setEditingSection(null);
      }
    });
  };

  if (isLoadingData || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Business Information</CardTitle>
            {editingSection !== 'business' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick('business')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editingSection === 'business' ? (
              <form onSubmit={businessForm.handleSubmit(handleBusinessSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Business Name</Label>
                    <Input
                      id="company_name"
                      {...businessForm.register('company_name')}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      {...businessForm.register('contact_name')}
                      placeholder="Contact Person Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...businessForm.register('email')}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...businessForm.register('phone')}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateFranchiseeData.isPending}
                  >
                    {updateFranchiseeData.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Business Name</Label>
                  <p className="text-sm">{franchiseeData?.company_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Name</Label>
                  <p className="text-sm">{franchiseeData?.contact_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{franchiseeData?.email || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{franchiseeData?.phone || 'Not set'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Address Information</CardTitle>
            {editingSection !== 'address' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick('address')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editingSection === 'address' ? (
              <form onSubmit={addressForm.handleSubmit(handleAddressSave)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...addressForm.register('address')}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...addressForm.register('city')}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...addressForm.register('state')}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      {...addressForm.register('zip')}
                      placeholder="12345"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateFranchiseeData.isPending}
                  >
                    {updateFranchiseeData.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{franchiseeData?.address || 'Not set'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">City</Label>
                    <p className="text-sm">{franchiseeData?.city || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">State</Label>
                    <p className="text-sm">{franchiseeData?.state || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ZIP Code</Label>
                    <p className="text-sm">{franchiseeData?.zip || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiver Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Waiver Settings</CardTitle>
            {editingSection !== 'waiver' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick('waiver')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editingSection === 'waiver' ? (
              <form onSubmit={waiverForm.handleSubmit(handleWaiverSave)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="waiver_text">Custom Waiver Text</Label>
                  <Textarea
                    id="waiver_text"
                    {...waiverForm.register('waiver_text')}
                    placeholder="Enter your custom waiver text here..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateSetting.isPending}
                  >
                    {updateSetting.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Custom Waiver Text</Label>
                <p className="text-sm whitespace-pre-wrap">
                  {settings?.waiver_text || 'No custom waiver text set. Click Edit to add your waiver terms.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
