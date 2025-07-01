import React from 'react';
import { Modal, TextInput, Select, Group, Button, Stack, Alert } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useCreateUser, type UserCreateData } from '@/hooks/useAdminUserActions';
import { IconInfoCircle } from '@tabler/icons-react';

const userCreateSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  subscription_tier: z.enum(['free', 'plus', 'pro']),
});

type UserCreateFormData = z.infer<typeof userCreateSchema>;

interface UserCreateModalProps {
  opened: boolean;
  onClose: () => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  opened,
  onClose,
}) => {
  const createUser = useCreateUser();

  const form = useForm<UserCreateFormData>({
    validate: zodResolver(userCreateSchema),
    initialValues: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      subscription_tier: 'free',
    },
  });

  const handleSubmit = async (values: UserCreateFormData) => {
    try {
      await createUser.mutateAsync({
        company_name: values.company_name,
        contact_name: values.contact_name,
        email: values.email,
        phone: values.phone || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        subscription_tier: values.subscription_tier,
      });
      form.reset();
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const tierOptions = [
    { value: 'free', label: 'Free (1 location, 5 classes)' },
    { value: 'plus', label: 'Plus ($29/mo - 3 locations, 25 classes)' },
    { value: 'pro', label: 'Pro ($79/mo - Unlimited)' },
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
      title="Create New User"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            A temporary password will be generated and the user will receive a password reset email.
          </Alert>

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

          <Select
            label="Subscription Tier"
            data={tierOptions}
            required
            {...form.getInputProps('subscription_tier')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={createUser.isPending}
              disabled={!form.isValid()}
            >
              Create User
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};