
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/mantine/Button';
import { Download, Mail, Plus } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Mantine/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'soccer_primary', 'soccer_secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon', 'soccer'],
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
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus size={16} />
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button leftSection={<Mail size={16} />}>
        Email
      </Button>
      <Button variant="outline" rightSection={<Download size={16} />}>
        Download
      </Button>
      <Button size="icon" variant="ghost">
        <Plus size={16} />
      </Button>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button loading>Loading</Button>
      <Button variant="outline" loading>Loading Outline</Button>
    </div>
  ),
};

export const SoccerVariants: Story = {
  render: () => (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <Button variant="soccer_primary" size="soccer">Soccer Primary</Button>
      <Button variant="soccer_secondary" size="soccer">Soccer Secondary</Button>
    </div>
  ),
};
