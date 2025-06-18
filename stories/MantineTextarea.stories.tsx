
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/mantine/Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Mantine/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="message">Message</label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <label htmlFor="small">Small (3 rows)</label>
        <Textarea id="small" placeholder="Small textarea" rows={3} />
      </div>
      <div>
        <label htmlFor="medium">Medium (5 rows)</label>
        <Textarea id="medium" placeholder="Medium textarea" rows={5} />
      </div>
      <div>
        <label htmlFor="large">Large (8 rows)</label>
        <Textarea id="large" placeholder="Large textarea" rows={8} />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <label htmlFor="normal">Normal</label>
        <Textarea id="normal" placeholder="Normal textarea" />
      </div>
      <div>
        <label htmlFor="error">Error</label>
        <Textarea id="error" placeholder="Error textarea" error="This field is required" />
      </div>
      <div>
        <label htmlFor="disabled">Disabled</label>
        <Textarea id="disabled" placeholder="Disabled textarea" disabled />
      </div>
    </div>
  ),
};
