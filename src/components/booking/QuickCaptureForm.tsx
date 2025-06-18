
import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/mantine/Button';
import { Input } from '@/components/mantine/TextInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useZodForm } from '@/hooks/useZodForm';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

const quickCaptureSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  zip: z.string().min(1, 'ZIP code is required'),
});

type QuickCaptureFormData = z.infer<typeof quickCaptureSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useZodForm(quickCaptureSchema, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: ''
  });

  const handleSubmit = async (formData: QuickCaptureFormData) => {
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

      console.log('Calling Edge Function with lead data:', leadData);

      // Call the Edge Function to create lead and booking
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('create-lead-and-booking', {
        body: {
          leadData,
          franchiseeId
        }
      });

      if (functionError) {
        console.error('Error calling create-lead-and-booking function:', functionError);
        throw new Error(`Failed to create lead: ${functionError.message}`);
      }

      if (!functionResponse?.success) {
        console.error('Function returned error:', functionResponse);
        throw new Error(functionResponse?.error || 'Unknown error occurred');
      }

      const { leadId } = functionResponse;
      console.log('Lead created successfully with ID:', leadId);

      toast.success('Information saved! Let\'s find classes near you.');
      
      // Track Meta Pixel Lead event
      if (onLeadCreated) {
        onLeadCreated();
      }
      
      // Pass the real lead ID and data to the success callback
      if (onSuccess) {
        const leadDataWithId = {
          id: leadId,
          ...leadData
        };
        onSuccess(leadId, leadDataWithId);
      }

    } catch (error) {
      console.error('Error in form submission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save information: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                {...form.getInputProps('firstName')}
                required
                placeholder="Enter first name"
                soccer
                error={!!form.errors.firstName}
                className="h-12"
              />
              {form.errors.firstName && (
                <p className="text-brand-red-600 text-xs mt-1 font-poppins">{form.errors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                {...form.getInputProps('lastName')}
                required
                placeholder="Enter last name"
                soccer
                error={!!form.errors.lastName}
                className="h-12"
              />
              {form.errors.lastName && (
                <p className="text-brand-red-600 text-xs mt-1 font-poppins">{form.errors.lastName}</p>
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
              {...form.getInputProps('email')}
              required
              placeholder="your.email@example.com"
              soccer
              error={!!form.errors.email}
              className="h-12"
            />
            {form.errors.email && (
              <p className="text-brand-red-600 text-xs mt-1 font-poppins">{form.errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              {...form.getInputProps('phone')}
              required
              placeholder="(555) 123-4567"
              soccer
              error={!!form.errors.phone}
              className="h-12"
            />
            {form.errors.phone && (
              <p className="text-brand-red-600 text-xs mt-1 font-poppins">{form.errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="zip" className="font-poppins text-sm font-medium text-brand-navy mb-1 block">
              ZIP Code *
            </Label>
            <Input
              id="zip"
              type="text"
              {...form.getInputProps('zip')}
              required
              placeholder="12345"
              maxLength={5}
              soccer
              error={!!form.errors.zip}
              className="h-12"
            />
            {form.errors.zip && (
              <p className="text-brand-red-600 text-xs mt-1 font-poppins">{form.errors.zip}</p>
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
