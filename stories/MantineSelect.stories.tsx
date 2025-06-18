
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '@/components/mantine/Select';

const meta: Meta<typeof Select> = {
  title: 'Mantine/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    soccer: {
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

const selectData = [
  { value: 'react', label: 'React' },
  { value: 'ng', label: 'Angular' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

export const Default: Story = {
  args: {
    placeholder: 'Select an option',
    data: selectData,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="framework">Framework</label>
      <Select
        id="framework"
        placeholder="Select framework"
        data={selectData}
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <label htmlFor="normal">Normal</label>
        <Select id="normal" placeholder="Normal select" data={selectData} />
      </div>
      <div>
        <label htmlFor="loading">Loading</label>
        <Select id="loading" placeholder="Loading select" data={selectData} loading />
      </div>
      <div>
        <label htmlFor="disabled">Disabled</label>
        <Select id="disabled" placeholder="Disabled select" data={selectData} disabled />
      </div>
    </div>
  ),
};

export const SoccerVariant: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label htmlFor="soccer-select" className="font-poppins">Soccer Select</label>
        <Select
          id="soccer-select"
          placeholder="Soccer Stars select"
          data={selectData}
          soccer
        />
      </div>
    </div>
  ),
};
