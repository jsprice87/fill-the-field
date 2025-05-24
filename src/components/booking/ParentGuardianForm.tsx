
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, FileText } from 'lucide-react';
import { useBookingSession } from '@/hooks/useBookingSession';

const ParentGuardianForm: React.FC = () => {
  const { sessionData, updateParentGuardianInfo, updateWaiverAccepted } = useBookingSession();
  const [formData, setFormData] = useState({
    firstName: sessionData.parentGuardianInfo?.firstName || '',
    lastName: sessionData.parentGuardianInfo?.lastName || '',
    email: sessionData.parentGuardianInfo?.email || '',
    phone: sessionData.parentGuardianInfo?.phone || '',
    relationship: sessionData.parentGuardianInfo?.relationship || 'Parent'
  });

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateParentGuardianInfo(newFormData);
  };

  const handleWaiverChange = (checked: boolean) => {
    updateWaiverAccepted(checked);
  };

  const isFormComplete = formData.firstName && formData.lastName && formData.email && formData.phone;

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
            <Label htmlFor="parentFirstName" className="font-poppins">First Name</Label>
            <Input
              id="parentFirstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Parent/Guardian first name"
              className="font-poppins"
            />
          </div>
          <div>
            <Label htmlFor="parentLastName" className="font-poppins">Last Name</Label>
            <Input
              id="parentLastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Parent/Guardian last name"
              className="font-poppins"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="parentEmail" className="font-poppins">Email Address</Label>
          <Input
            id="parentEmail"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className="font-poppins"
          />
        </div>

        <div>
          <Label htmlFor="parentPhone" className="font-poppins">Phone Number</Label>
          <Input
            id="parentPhone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="font-poppins"
          />
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

        <div className="border-t pt-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="waiver"
              checked={sessionData.waiverAccepted || false}
              onCheckedChange={handleWaiverChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="waiver" className="font-poppins text-sm leading-relaxed">
                I agree to the terms and conditions outlined in the{' '}
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
                      </DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm max-w-none font-poppins">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <strong>ASSUMPTION OF RISK, WAIVER OF CLAIMS & INDEMNIFICATION AGREEMENT</strong>
                      </p>
                      
                      <p className="text-sm text-gray-700 leading-relaxed mt-4">
                        In consideration for being permitted to participate in soccer activities, programs, and/or use facilities 
                        owned or operated by Soccer Stars, I acknowledge, understand, and agree to the following:
                      </p>

                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>1. ASSUMPTION OF RISK:</strong> I understand that participation in soccer activities involves 
                          inherent risks including but not limited to: physical injury, property damage, and other unforeseen 
                          circumstances. I voluntarily assume all risks associated with participation.
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>2. WAIVER OF CLAIMS:</strong> I hereby waive, release, and discharge Soccer Stars, its owners, 
                          employees, coaches, and affiliates from any and all claims, demands, or causes of action arising from 
                          participation in soccer activities.
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>3. INDEMNIFICATION:</strong> I agree to indemnify and hold harmless Soccer Stars from any 
                          claims brought by third parties arising from my child's participation in soccer activities.
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>4. MEDICAL TREATMENT:</strong> I authorize Soccer Stars staff to secure emergency medical 
                          treatment if needed and agree to be responsible for any associated costs.
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>5. MEDIA RELEASE:</strong> I grant permission for Soccer Stars to use photographs and videos 
                          of participants for promotional purposes.
                        </p>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed mt-4">
                        I acknowledge that I have read this agreement, understand its contents, and sign it voluntarily.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
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

        {!sessionData.waiverAccepted && isFormComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-poppins">
              Please review and accept the liability waiver to continue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentGuardianForm;
