
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  zip: z.string().min(5, "Please enter a valid ZIP code"),
});

type FormData = z.infer<typeof formSchema>;

interface QuickCaptureFormProps {
  franchiseeId: string;
  onSuccess: (leadId: string) => void;
  onCancel?: () => void;
  showTitle?: boolean;
}

export const QuickCaptureForm: React.FC<QuickCaptureFormProps> = ({
  franchiseeId,
  onSuccess,
  onCancel,
  showTitle = false
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const formatPhoneE164 = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return `+1${cleaned}`;
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Get franchisee by slug
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('id')
        .eq('slug', franchiseeId)
        .single();

      if (franchiseeError || !franchisee) {
        throw new Error('Franchisee not found');
      }

      // Create lead with status "new"
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          franchisee_id: franchisee.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: formatPhoneE164(data.phone),
          zip: data.zip,
          status: 'new',
          source: 'free_trial_form'
        })
        .select('id')
        .single();

      if (leadError || !leadData) {
        throw leadError;
      }

      toast.success('Information saved! Let\'s find classes near you.');
      onSuccess(leadData.id);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-6">
          <h3 className="font-agrandir text-2xl text-brand-navy text-center">Get Started</h3>
          <p className="font-poppins text-brand-grey text-center mt-2">
            Tell us about yourself to find free trial classes
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-poppins font-medium">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-poppins font-medium">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-poppins font-medium">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-poppins font-medium">Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-poppins font-medium">ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your ZIP code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-poppins font-semibold py-3"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Find A Class Near You'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
