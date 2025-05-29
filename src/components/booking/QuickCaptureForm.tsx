
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuickCaptureFormProps {
  franchiseeId: string;
  onSuccess?: (leadId: string, leadData: any) => void;
  showTitle?: boolean;
}

export const QuickCaptureForm: React.FC<QuickCaptureFormProps> = ({
  franchiseeId,
  onSuccess,
  showTitle = false
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Creating lead for franchisee ID:', franchiseeId);

      // Create lead directly with the franchisee ID
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          franchisee_id: franchiseeId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          zip: formData.zip,
          source: 'free_trial_booking',
          status: 'new',
          status_manually_set: false
        })
        .select()
        .single();

      if (leadError) {
        console.error('Lead creation error:', leadError);
        throw leadError;
      }

      console.log('Lead created successfully:', lead);
      toast.success('Information saved! Let\'s find classes near you.');
      
      if (onSuccess) {
        onSuccess(lead.id, lead);
      }

    } catch (error: any) {
      console.error('Error creating lead:', error);
      const errorMessage = error.message || 'Failed to save information. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full border-0 shadow-none">
      {showTitle && (
        <CardHeader className="text-center pb-4">
          <CardTitle className="font-agrandir text-2xl text-brand-navy">
            Get Started with Your Free Trial
          </CardTitle>
          <p className="font-poppins text-gray-600 text-sm">
            Just a few details to find classes near you
          </p>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="font-poppins text-sm font-medium text-gray-700 mb-1 block">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                placeholder="Enter first name"
                className="font-poppins bg-white border-2 border-gray-200 focus:border-brand-blue text-gray-900 placeholder:text-gray-500 h-11"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="font-poppins text-sm font-medium text-gray-700 mb-1 block">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                placeholder="Enter last name"
                className="font-poppins bg-white border-2 border-gray-200 focus:border-brand-blue text-gray-900 placeholder:text-gray-500 h-11"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="font-poppins text-sm font-medium text-gray-700 mb-1 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="your.email@example.com"
              className="font-poppins bg-white border-2 border-gray-200 focus:border-brand-blue text-gray-900 placeholder:text-gray-500 h-11"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="font-poppins text-sm font-medium text-gray-700 mb-1 block">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              placeholder="(555) 123-4567"
              className="font-poppins bg-white border-2 border-gray-200 focus:border-brand-blue text-gray-900 placeholder:text-gray-500 h-11"
            />
          </div>

          <div>
            <Label htmlFor="zip" className="font-poppins text-sm font-medium text-gray-700 mb-1 block">
              ZIP Code *
            </Label>
            <Input
              id="zip"
              type="text"
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              required
              placeholder="12345"
              maxLength={5}
              className="font-poppins bg-white border-2 border-gray-200 focus:border-brand-blue text-gray-900 placeholder:text-gray-500 h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-poppins text-lg py-6 h-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Classes...
              </>
            ) : (
              'Find Free Trial Classes'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center font-poppins leading-relaxed">
            By submitting, you agree to receive information about Soccer Stars programs. 
            We respect your privacy and won't spam you.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
