
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, MapPin, Users, FileText, MessageSquare, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFranchiseeWaiver } from '@/hooks/useFranchiseeWaiver';
import type { BookingFlowData } from '@/hooks/useBookingFlow';

interface ParentGuardianFormProps {
  flowData: BookingFlowData;
  updateFlow: (updates: Partial<BookingFlowData>) => Promise<void>;
}

const ParentGuardianForm: React.FC<ParentGuardianFormProps> = ({ flowData, updateFlow }) => {
  const { waiverText } = useFranchiseeWaiver(flowData);
  
  // Pre-populate with lead data if available
  const leadData = flowData.leadData;
  console.log('form-initial-values', {
    leadData,
    parentGuardianInfo: flowData.parentGuardianInfo
  });
  
  const parentInfo = flowData.parentGuardianInfo || {
    firstName: leadData?.firstName || '',
    lastName: leadData?.lastName || '',
    email: leadData?.email || '',
    phone: leadData?.phone || '',
    zip: leadData?.zip || '',
    relationship: ''
  };

  const handleFieldChange = async (field: string, value: any) => {
    await updateFlow({
      parentGuardianInfo: {
        ...parentInfo,
        [field]: value
      }
    });
  };

  const handleAgreementChange = async (field: keyof BookingFlowData, value: boolean) => {
    await updateFlow({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Parent/Guardian Information */}
      <Card className="border-l-4 border-l-brand-blue">
        <CardHeader>
          <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
            <User className="h-5 w-5" />
            Parent/Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="font-poppins text-sm font-medium text-gray-700 mb-2 block">
                <User className="h-4 w-4 inline mr-1" />
                First Name *
              </Label>
              <Input
                id="firstName"
                value={parentInfo.firstName || ''}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="font-poppins"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lastName" className="font-poppins text-sm font-medium text-gray-700 mb-2 block">
                <User className="h-4 w-4 inline mr-1" />
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={parentInfo.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="font-poppins"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="font-poppins text-sm font-medium text-gray-700 mb-2 block">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={parentInfo.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="Enter email address"
              className="font-poppins"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="font-poppins text-sm font-medium text-gray-700 mb-2 block">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={parentInfo.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="(000) 000-0000"
                className="font-poppins"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="zip" className="font-poppins text-sm font-medium text-gray-700 mb-2 block">
                <MapPin className="h-4 w-4 inline mr-1" />
                ZIP Code *
              </Label>
              <Input
                id="zip"
                value={parentInfo.zip || ''}
                onChange={(e) => handleFieldChange('zip', e.target.value)}
                placeholder="12345"
                className="font-poppins"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="relationship" className="font-poppins text-sm font-medium text-gray-700 mb-2 block">
              <Users className="h-4 w-4 inline mr-1" />
              Relationship to Child *
            </Label>
            <Select value={parentInfo.relationship || ''} onValueChange={(value) => handleFieldChange('relationship', value)}>
              <SelectTrigger className="font-poppins">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Guardian">Legal Guardian</SelectItem>
                <SelectItem value="Grandparent">Grandparent</SelectItem>
                <SelectItem value="Aunt/Uncle">Aunt/Uncle</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Required Agreements */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Agreements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="waiver"
              checked={flowData.waiverAccepted || false}
              onCheckedChange={(checked) => handleAgreementChange('waiverAccepted', !!checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="waiver" 
                className="font-poppins text-sm cursor-pointer"
              >
                I agree to the{' '}
                <a 
                  href={`/${window.location.pathname.split('/')[1]}/waiver`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:text-brand-blue/80 underline"
                >
                  liability waiver and agreement
                </a>
                . *
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="communication"
              checked={flowData.communicationPermission || false}
              onCheckedChange={(checked) => handleAgreementChange('communicationPermission', !!checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="communication" 
                className="font-poppins text-sm cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 inline mr-1" />
                I agree to receive communication about my child's soccer classes and important updates. *
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={flowData.marketingPermission || false}
              onCheckedChange={(checked) => handleAgreementChange('marketingPermission', !!checked)}
            />
            <div className="flex-1">
              <Label 
                htmlFor="marketing" 
                className="font-poppins text-sm cursor-pointer"
              >
                <Heart className="h-4 w-4 inline mr-1" />
                I would like to receive promotional offers and news about Soccer Stars programs (optional).
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Child Language */}
      <Card className="border-l-4 border-l-blue-400">
        <CardHeader>
          <CardTitle className="font-agrandir text-xl text-brand-navy">
            Language Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="font-poppins text-sm font-medium text-gray-700 mb-3 block">
              Does your child speak English fluently?
            </Label>
            <RadioGroup
              value={flowData.childSpeaksEnglish === true ? 'yes' : flowData.childSpeaksEnglish === false ? 'no' : ''}
              onValueChange={(value) => handleAgreementChange('childSpeaksEnglish', value === 'yes')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="english-yes" />
                <Label htmlFor="english-yes" className="font-poppins">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="english-no" />
                <Label htmlFor="english-no" className="font-poppins">No</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentGuardianForm;
