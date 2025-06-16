
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/mantine/TextInput';
import { Search, Mail } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Mantine/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    soccer: {
      control: { type: 'boolean' },
    },
    error: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email">Email</label>
      <Input id="email" placeholder="Email" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <Input 
        placeholder="Search..." 
        leftSection={<Search size={16} />}
      />
      <Input 
        placeholder="Email address"
        leftSection={<Mail size={16} />}
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <label htmlFor="normal">Normal</label>
        <Input id="normal" placeholder="Normal input" />
      </div>
      <div>
        <label htmlFor="error">Error</label>
        <Input id="error" placeholder="Error input" error />
      </div>
      <div>
        <label htmlFor="loading">Loading</label>
        <Input id="loading" placeholder="Loading input" loading />
      </div>
      <div>
        <label htmlFor="disabled">Disabled</label>
        <Input id="disabled" placeholder="Disabled input" disabled />
      </div>
    </div>
  ),
};

export const SoccerVariant: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label htmlFor="soccer-normal" className="font-poppins">Soccer Input</label>
        <Input id="soccer-normal" placeholder="Soccer Stars input" soccer />
      </div>
      <div>
        <label htmlFor="soccer-error" className="font-poppins">Soccer Error</label>
        <Input id="soccer-error" placeholder="Soccer Stars error" soccer error />
      </div>
    </div>
  ),
};
