
import type { Meta, StoryObj } from '@storybook/react';
import { AppDatePicker } from '@/components/mantine/DatePicker';

const meta: Meta<typeof AppDatePicker> = {
  title: 'Mantine/AppDatePicker',
  component: AppDatePicker,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Example date',
    placeholder: 'Select date',
  },
};

export const WithError: Story = {
  args: {
    label: 'Birth Date',
    placeholder: 'Select birth date',
    error: 'Birth date is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Date',
    placeholder: 'Select date',
    withAsterisk: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date',
    placeholder: 'Cannot select',
    disabled: true,
  },
};
