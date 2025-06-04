import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface QuickCaptureFormProps {
  franchiseeId: string;
  onSuccess?: (leadId: string, leadData: any) => void;
  showTitle?: boolean;
  onLeadCreated?: () => void;
}

export const QuickCaptureForm: React.FC<QuickCaptureFormProps> = ({
  franchiseeId,
  onSuccess,
  showTitle = false,
  onLeadCreated
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Validate franchiseeId
      if (!franchiseeId) {
        throw new Error('Missing franchisee information');
      }

      const leadData = {
        franchisee_id: franchiseeId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        zip: formData.zip,
        source: 'free_trial_booking',
        status: 'new' as LeadStatus
      };

      // Insert and get the minimal response with ID to avoid RLS violation
      const { data, error: leadError } = await supabase
        .from('leads')
        .insert(leadData)
        .select('id')
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
        throw new Error(`Failed to save lead: ${leadError.message}`);
      }

      if (!data || !data.id) {
        throw new Error('Lead was created but ID was not returned');
      }

      console.log('Lead created with ID:', data.id);

      toast.success('Information saved! Let\'s find classes near you.');
      
      // Track Meta Pixel Lead event
      if (onLeadCreated) {
        onLeadCreated();
      }
      
      // Use the real lead ID from the database
      if (onSuccess) {
        const leadDataWithId = {
          id: data.id,
          ...leadData
        };
        onSuccess(data.id, leadDataWithId);
      }

    } catch (error) {
      console.error('Error in form submission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save information: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      {showTitle && (
        <CardHeader className="text-center pb-4">
          <CardTitle className="font-agrandir text-2xl text-brand-navy">
            Get Started with Your Free Trial
          </CardTitle>
          <p className="font-poppins text-brand-grey text-sm">
            Just a few details to find classes near you
          </p>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                placeholder="Enter first name"
                soccer
                error={!!errors.firstName}
                className="h-12"
              />
              {errors.firstName && (
                <p className="text-brand-red-600 text-xs mt-1 font-poppins">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                placeholder="Enter last name"
                soccer
                error={!!errors.lastName}
                className="h-12"
              />
              {errors.lastName && (
                <p className="text-brand-red-600 text-xs mt-1 font-poppins">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="your.email@example.com"
              soccer
              error={!!errors.email}
              className="h-12"
            />
            {errors.email && (
              <p className="text-brand-red-600 text-xs mt-1 font-poppins">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              placeholder="(555) 123-4567"
              soccer
              error={!!errors.phone}
              className="h-12"
            />
            {errors.phone && (
              <p className="text-brand-red-600 text-xs mt-1 font-poppins">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="zip" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
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
              soccer
              error={!!errors.zip}
              className="h-12"
            />
            {errors.zip && (
              <p className="text-brand-red-600 text-xs mt-1 font-poppins">{errors.zip}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="soccer_primary"
            size="soccer"
            className="w-full text-lg"
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

          <p className="text-xs text-brand-grey text-center font-poppins leading-relaxed">
            By submitting, you agree to receive information about Soccer Stars programs. 
            We respect your privacy and won't spam you.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
