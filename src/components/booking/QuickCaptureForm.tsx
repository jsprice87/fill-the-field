
import React, { useState } from 'react';
import { z } from 'zod';
import { Button, TextInput, Card, Stack, Grid, Text, Title } from '@mantine/core';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/utils/notify';
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

      notify('success', 'Information saved! Let\'s find classes near you.');
      
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
      notify('error', `Failed to save information: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none" padding={0} radius="md">
      {showTitle && (
        <div className="text-center pb-4">
          <Title order={2} className="font-agrandir text-2xl text-brand-navy" mb="xs">
            Get Started with Your Free Trial
          </Title>
          <Text className="font-poppins text-brand-grey" size="sm">
            Just a few details to find classes near you
          </Text>
        </div>
      )}
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                id="firstName"
                label="First Name *"
                type="text"
                {...form.getInputProps('firstName')}
                required
                placeholder="Enter first name"
                size="lg"
                className="font-poppins"
                styles={{
                  label: {
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#021D49',
                    marginBottom: '4px'
                  }
                }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                id="lastName"
                label="Last Name *"
                type="text"
                {...form.getInputProps('lastName')}
                required
                placeholder="Enter last name"
                size="lg"
                className="font-poppins"
                styles={{
                  label: {
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#021D49',
                    marginBottom: '4px'
                  }
                }}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            id="email"
            label="Email Address *"
            type="email"
            {...form.getInputProps('email')}
            required
            placeholder="your.email@example.com"
            size="lg"
            className="font-poppins"
            styles={{
              label: {
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 500,
                color: '#021D49',
                marginBottom: '4px'
              }
            }}
          />

          <TextInput
            id="phone"
            label="Phone Number *"
            type="tel"
            {...form.getInputProps('phone')}
            required
            placeholder="(555) 123-4567"
            size="lg"
            className="font-poppins"
            styles={{
              label: {
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 500,
                color: '#021D49',
                marginBottom: '4px'
              }
            }}
          />

          <TextInput
            id="zip"
            label="ZIP Code *"
            type="text"
            {...form.getInputProps('zip')}
            required
            placeholder="12345"
            maxLength={5}
            size="lg"
            className="font-poppins"
            styles={{
              label: {
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 500,
                color: '#021D49',
                marginBottom: '4px'
              }
            }}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins"
            size="lg"
            fullWidth
            styles={{
              root: {
                fontSize: '18px'
              }
            }}
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

          <Text className="text-xs text-brand-grey text-center font-poppins leading-relaxed">
            By submitting, you agree to receive information about Soccer Stars programs. 
            We respect your privacy and won't spam you.
          </Text>
        </Stack>
      </form>
    </Card>
  );
};
