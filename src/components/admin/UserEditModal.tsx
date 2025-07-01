import React from 'react';
import { Modal, TextInput, Select, Group, Button, Stack } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useUpdateUser, type UserUpdateData } from '@/hooks/useAdminUserActions';

const userEditSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  subscription_status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  subscription_tier: z.enum(['free', 'plus', 'pro']),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface User {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  subscription_status?: string | null;
  subscription_tier?: string | null;
}

interface UserEditModalProps {
  user: User | null;
  opened: boolean;
  onClose: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  opened,
  onClose,
}) => {
  const updateUser = useUpdateUser();

  const form = useForm<UserEditFormData>({
    validate: zodResolver(userEditSchema),
    initialValues: {
      company_name: user?.company_name || '',
      contact_name: user?.contact_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      subscription_status: (user?.subscription_status as UserEditFormData['subscription_status']) || 'active',
      subscription_tier: (user?.subscription_tier as UserEditFormData['subscription_tier']) || 'free',
    },
  });

  React.useEffect(() => {
    if (user) {
      form.setValues({
        company_name: user.company_name || '',
        contact_name: user.contact_name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        subscription_status: (user.subscription_status as UserEditFormData['subscription_status']) || 'active',
        subscription_tier: (user.subscription_tier as UserEditFormData['subscription_tier']) || 'free',
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: UserEditFormData) => {
    if (!user) return;

    try {
      await updateUser.mutateAsync({
        userId: user.id,
        userData: {
          company_name: values.company_name,
          contact_name: values.contact_name,
          email: values.email,
          phone: values.phone || null,
          city: values.city || null,
          state: values.state || null,
          subscription_status: values.subscription_status,
          subscription_tier: values.subscription_tier,
        },
      });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const tierOptions = [
    { value: 'free', label: 'Free' },
    { value: 'plus', label: 'Plus ($29/mo)' },
    { value: 'pro', label: 'Pro ($79/mo)' },
  ];

  const stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Edit User: ${user?.company_name || 'User'}`}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            required
            {...form.getInputProps('company_name')}
          />

          <TextInput
            label="Contact Name"
            placeholder="Enter contact name"
            required
            {...form.getInputProps('contact_name')}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            required
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            {...form.getInputProps('phone')}
          />

          <Group grow>
            <TextInput
              label="City"
              placeholder="Enter city"
              {...form.getInputProps('city')}
            />

            <Select
              label="State"
              placeholder="Select state"
              data={stateOptions}
              searchable
              clearable
              {...form.getInputProps('state')}
            />
          </Group>

          <Group grow>
            <Select
              label="Subscription Status"
              data={statusOptions}
              required
              {...form.getInputProps('subscription_status')}
            />

            <Select
              label="Subscription Tier"
              data={tierOptions}
              required
              {...form.getInputProps('subscription_tier')}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={updateUser.isPending}
              disabled={!form.isValid()}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};