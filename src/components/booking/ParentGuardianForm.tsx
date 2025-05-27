
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { BookingFlowData } from '@/hooks/useBookingFlow';

interface ParentGuardianFormProps {
  flowData: BookingFlowData;
  updateFlow: (updates: Partial<BookingFlowData>) => Promise<void>;
}

const ParentGuardianForm: React.FC<ParentGuardianFormProps> = ({ 
  flowData, 
  updateFlow 
}) => {
  const [customWaiver, setCustomWaiver] = useState<string>('');
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: '',
    relationship: 'Parent'
  });

  // Load franchisee and custom waiver data
  useEffect(() => {
    const loadFranchiseeData = async () => {
      console.log('Loading franchisee data, flowData:', flowData);
      
      // Get franchisee ID from the selected location or flow data
      const selectedLocation = flowData.selectedLocation;
      let franchiseeId = null;
      
      if (selectedLocation) {
        console.log('Selected location:', selectedLocation);
        // Get franchisee ID from the location
        const { data: location, error: locationError } = await supabase
          .from('locations')
          .select('franchisee_id')
          .eq('id', selectedLocation.id)
          .single();
          
        if (!locationError && location) {
          franchiseeId = location.franchisee_id;
          console.log('Got franchisee ID from location:', franchiseeId);
        } else {
          console.error('Error getting franchisee from location:', locationError);
        }
      }
      
      // If no franchisee ID from location, try to get it from the URL or flow
      if (!franchiseeId) {
        console.log('No franchisee ID from location, checking URL...');
        // Extract from current URL path if possible
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1) {
          const slug = pathParts[1]; // First part after domain should be the slug
          console.log('Trying to get franchisee by slug:', slug);
          
          const { data: franchisee, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('id')
            .eq('slug', slug)
            .single();
            
          if (!franchiseeError && franchisee) {
            franchiseeId = franchisee.id;
            console.log('Got franchisee ID from slug:', franchiseeId);
          } else {
            console.error('Error getting franchisee by slug:', franchiseeError);
          }
        }
      }
      
      if (!franchiseeId) {
        console.log('No franchisee ID found, cannot load custom waiver');
        return;
      }
      
      try {
        // Get franchisee data
        const { data: franchisee, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('*')
          .eq('id', franchiseeId)
          .single();

        if (franchiseeError) {
          console.error('Error loading franchisee:', franchiseeError);
          return;
        }

        console.log('Loaded franchisee data:', franchisee);
        setFranchiseeData(franchisee);

        // Get custom waiver from settings
        const { data: settings, error: settingsError } = await supabase
          .from('franchisee_settings')
          .select('setting_value')
          .eq('franchisee_id', franchisee.id)
          .eq('setting_key', 'waiver_text')
          .single();

        if (!settingsError && settings?.setting_value) {
          console.log('Loaded custom waiver text:', settings.setting_value.substring(0, 100) + '...');
          setCustomWaiver(settings.setting_value);
        } else {
          console.log('No custom waiver found or error:', settingsError);
        }
      } catch (error) {
        console.error('Error loading franchisee data:', error);
      }
    };

    loadFranchiseeData();
  }, [flowData.selectedLocation]);

  // Pre-fill form with lead data on component mount
  useEffect(() => {
    console.log('ParentGuardianForm: Setting up form data', { flowData });
    
    const leadData = flowData.leadData;
    const parentInfo = flowData.parentGuardianInfo;
    
    const initialData = {
      firstName: parentInfo?.firstName || leadData?.firstName || '',
      lastName: parentInfo?.lastName || leadData?.lastName || '',
      email: parentInfo?.email || leadData?.email || '',
      phone: parentInfo?.phone || leadData?.phone || '',
      zip: parentInfo?.zip || leadData?.zip || '',
      relationship: parentInfo?.relationship || 'Parent'
    };
    
    console.log('ParentGuardianForm: Initial data set to:', initialData);
    setFormData(initialData);
    
    // If we have lead data and no existing parent info, update the flow immediately
    if (leadData && (!parentInfo?.firstName || !parentInfo?.email)) {
      console.log('ParentGuardianForm: Updating flow with lead data');
      updateParentGuardianInfo(initialData);
    }
  }, [flowData.leadData, flowData.parentGuardianInfo]);

  const updateParentGuardianInfo = async (info: any) => {
    console.log('🔄 Updating parent guardian info:', info);
    try {
      await updateFlow({ parentGuardianInfo: info });
      console.log('✅ Parent guardian info updated successfully');
    } catch (error) {
      console.error('❌ Error updating parent guardian info:', error);
    }
  };

  const updateWaiverAccepted = async (accepted: boolean) => {
    console.log('🔄 Updating waiver accepted:', accepted);
    try {
      await updateFlow({ waiverAccepted: accepted });
      console.log('✅ Waiver acceptance updated successfully');
    } catch (error) {
      console.error('❌ Error updating waiver acceptance:', error);
    }
  };

  const updateCommunicationPermission = async (permission: boolean) => {
    console.log('🔄 Updating communication permission:', permission);
    try {
      await updateFlow({ communicationPermission: permission });
      console.log('✅ Communication permission updated successfully');
    } catch (error) {
      console.error('❌ Error updating communication permission:', error);
    }
  };

  const updateMarketingPermission = async (permission: boolean) => {
    console.log('🔄 Updating marketing permission:', permission);
    try {
      await updateFlow({ marketingPermission: permission });
      console.log('✅ Marketing permission updated successfully');
    } catch (error) {
      console.error('❌ Error updating marketing permission:', error);
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    console.log(`📝 Input changed - ${field}:`, value);
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Immediately update the flow with the new data
    await updateParentGuardianInfo(newFormData);
  };

  const handleWaiverChange = async (checked: boolean) => {
    console.log('☑️ Waiver checkbox changed:', checked);
    await updateWaiverAccepted(checked);
  };

  const handleCommunicationPermissionChange = async (checked: boolean) => {
    console.log('📞 Communication permission changed:', checked);
    await updateCommunicationPermission(checked);
  };

  const handleMarketingPermissionChange = async (checked: boolean) => {
    console.log('📧 Marketing permission changed:', checked);
    await updateMarketingPermission(checked);
  };

  const isFormComplete = formData.firstName && formData.lastName && formData.email && formData.phone && formData.zip;

  // Default waiver text if no custom waiver is found
  const defaultWaiver = `
    ASSUMPTION OF RISK, WAIVER OF CLAIMS & INDEMNIFICATION AGREEMENT

    In consideration for being permitted to participate in soccer activities, programs, and/or use facilities 
    owned or operated by Soccer Stars, I acknowledge, understand, and agree to the following:

    1. ASSUMPTION OF RISK: I understand that participation in soccer activities involves 
    inherent risks including but not limited to: physical injury, property damage, and other unforeseen 
    circumstances. I voluntarily assume all risks associated with participation.

    2. WAIVER OF CLAIMS: I hereby waive, release, and discharge Soccer Stars, its owners, 
    employees, coaches, and affiliates from any and all claims, demands, or causes of action arising from 
    participation in soccer activities.

    3. INDEMNIFICATION: I agree to indemnify and hold harmless Soccer Stars from any 
    claims brought by third parties arising from my child's participation in soccer activities.

    4. MEDICAL TREATMENT: I authorize Soccer Stars staff to secure emergency medical 
    treatment if needed and agree to be responsible for any associated costs.

    5. MEDIA RELEASE: I grant permission for Soccer Stars to use photographs and videos 
    of participants for promotional purposes.

    I acknowledge that I have read this agreement, understand its contents, and sign it voluntarily.
  `;

  const waiverText = customWaiver || defaultWaiver;

  // Debug log to see current flow state
  console.log('Current flow data in ParentGuardianForm:', {
    waiverAccepted: flowData.waiverAccepted,
    communicationPermission: flowData.communicationPermission,
    marketingPermission: flowData.marketingPermission,
    parentGuardianInfo: flowData.parentGuardianInfo,
    formData
  });

  return (
    <Card className="border-l-4 border-l-brand-red">
      <CardHeader>
        <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
          <User className="h-5 w-5" />
          Parent/Guardian Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parentFirstName" className="font-poppins">First Name *</Label>
            <Input
              id="parentFirstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Parent/Guardian first name"
              className="font-poppins"
              required
            />
          </div>
          <div>
            <Label htmlFor="parentLastName" className="font-poppins">Last Name *</Label>
            <Input
              id="parentLastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Parent/Guardian last name"
              className="font-poppins"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="parentEmail" className="font-poppins">Email Address *</Label>
          <Input
            id="parentEmail"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className="font-poppins"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parentPhone" className="font-poppins">Phone Number *</Label>
            <Input
              id="parentPhone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="font-poppins"
              required
            />
          </div>
          <div>
            <Label htmlFor="parentZip" className="font-poppins">ZIP Code *</Label>
            <Input
              id="parentZip"
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              placeholder="12345"
              className="font-poppins"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="relationship" className="font-poppins">Relationship to Child(ren)</Label>
          <Input
            id="relationship"
            value={formData.relationship}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
            placeholder="Parent, Guardian, etc."
            className="font-poppins"
          />
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="waiver"
              checked={flowData.waiverAccepted || false}
              onCheckedChange={handleWaiverChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="waiver" className="font-poppins text-sm leading-relaxed">
                <span className="text-red-500">*</span> I agree to the terms and conditions outlined in the{' '}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto text-brand-blue underline font-poppins text-sm">
                      liability waiver and agreement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-agrandir text-brand-navy flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Liability Waiver and Agreement
                        {franchiseeData && (
                          <span className="text-sm font-poppins text-gray-600">
                            - {franchiseeData.company_name}
                          </span>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm max-w-none font-poppins">
                      <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {waiverText}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="communication"
              checked={flowData.communicationPermission || false}
              onCheckedChange={handleCommunicationPermissionChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="communication" className="font-poppins text-sm leading-relaxed">
                <span className="text-red-500">*</span> I give permission to be contacted via email, SMS, and phone regarding important updates about classes such as cancellations, weather delays, and schedule changes.
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="marketing"
              checked={flowData.marketingPermission || false}
              onCheckedChange={handleMarketingPermissionChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="marketing" className="font-poppins text-sm leading-relaxed">
                I would like to receive marketing information and updates about upcoming promotions and special offers.
              </Label>
            </div>
          </div>
        </div>

        {!isFormComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-poppins">
              Please complete all required parent/guardian information above.
            </p>
          </div>
        )}

        {(!flowData.waiverAccepted || !flowData.communicationPermission) && isFormComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-poppins">
              Please accept the required agreements to continue.
            </p>
          </div>
        )}

        {/* Debug section for form data */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <div className="font-semibold mb-2">ParentGuardianForm Debug:</div>
          <div>Form Data: {JSON.stringify(formData)}</div>
          <div>Flow Parent Info: {JSON.stringify(flowData.parentGuardianInfo || 'Not set')}</div>
          <div>Waiver Accepted: {String(flowData.waiverAccepted || false)}</div>
          <div>Communication Permission: {String(flowData.communicationPermission || false)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentGuardianForm;
