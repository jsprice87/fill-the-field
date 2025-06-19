import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@mantine/core';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { EnhancedSelect, EnhancedSelectItem } from '@/components/ui/enhanced-select';
import { EnhancedCheckbox } from '@/components/ui/enhanced-checkbox';
import { FormSection } from '@/components/ui/form-section';
import { FieldGroup } from '@/components/ui/field-group';
import { Mail, Phone, User, MapPin } from 'lucide-react';

const ExampleEnhancedForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    notes: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation example
    const newErrors: Record<string, string> = {};
    const newSuccess: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else {
      newSuccess.firstName = 'Looks good!';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else {
      newSuccess.email = 'Valid email format';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    setSuccess(newSuccess);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Handle successful submission
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Form Components Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Personal Information"
            description="Please provide your basic information"
            required
          >
            <FieldGroup orientation="horizontal">
              <div className="flex-1">
                <EnhancedInput
                  label="First Name"
                  placeholder="Enter your first name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  error={errors.firstName}
                  success={success.firstName}
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>
              <div className="flex-1">
                <EnhancedInput
                  label="Last Name"
                  placeholder="Enter your last name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </FieldGroup>

            <EnhancedInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              success={success.email}
              leftIcon={<Mail className="h-4 w-4" />}
              hint="We'll never share your email with anyone else"
            />

            <EnhancedInput
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              leftIcon={<Phone className="h-4 w-4" />}
            />

            <EnhancedInput
              label="Password"
              type="password"
              placeholder="Enter a secure password"
              showPasswordToggle
              hint="Password must be at least 8 characters long"
            />
          </FormSection>

          <FormSection
            title="Location & Preferences"
            description="Help us customize your experience"
          >
            <EnhancedSelect
              label="Preferred Location"
              placeholder="Select a location"
              value={formData.location}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              hint="Choose the location closest to you"
            >
              <EnhancedSelectItem value="denver">Denver, CO</EnhancedSelectItem>
              <EnhancedSelectItem value="boulder">Boulder, CO</EnhancedSelectItem>
              <EnhancedSelectItem value="aurora">Aurora, CO</EnhancedSelectItem>
              <EnhancedSelectItem value="lakewood">Lakewood, CO</EnhancedSelectItem>
            </EnhancedSelect>

            <EnhancedTextarea
              label="Additional Notes"
              placeholder="Tell us anything else we should know..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              maxLength={300}
              showCharacterCount
              hint="Optional: Share any special requirements or preferences"
            />
          </FormSection>

          <FormSection title="Agreements">
            <div className="space-y-4">
              <EnhancedCheckbox
                label="I agree to the Terms of Service"
                description="By checking this box, you agree to our terms and conditions"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))}
                error={errors.agreeToTerms}
              />

              <EnhancedCheckbox
                label="Subscribe to newsletter"
                description="Receive updates about new programs and special offers"
                checked={formData.subscribeNewsletter}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribeNewsletter: !!checked }))}
              />
            </div>
          </FormSection>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Submit Form
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  location: '',
                  notes: '',
                  agreeToTerms: false,
                  subscribeNewsletter: false
                });
                setErrors({});
                setSuccess({});
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExampleEnhancedForm;
