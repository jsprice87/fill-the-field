
import type { Meta, StoryObj } from '@storybook/react';

const TokenPreview = () => {
  const colors = [
    { name: 'primary-50', class: 'bg-primary-50', hex: '#ECFDF5' },
    { name: 'primary-500', class: 'bg-primary-500', hex: '#10B981' },
    { name: 'primary-600', class: 'bg-primary-600', hex: '#059669' },
    { name: 'primary-700', class: 'bg-primary-700', hex: '#047857' },
    { name: 'gray-50', class: 'bg-gray-50', hex: '#F9FAFB' },
    { name: 'gray-100', class: 'bg-gray-100', hex: '#F3F4F6' },
    { name: 'gray-700', class: 'bg-gray-700', hex: '#374151' },
    { name: 'gray-900', class: 'bg-gray-900', hex: '#111827' },
    { name: 'error-500', class: 'bg-error-500', hex: '#EF4444' },
    { name: 'warning-500', class: 'bg-warning-500', hex: '#F59E0B' },
    { name: 'success-500', class: 'bg-success-500', hex: '#22C55E' },
  ];

  const typography = [
    { name: 'h1', class: 'text-h1', description: '30px / 36px, weight 600' },
    { name: 'h2', class: 'text-h2', description: '24px / 32px, weight 600' },
    { name: 'h3', class: 'text-h3', description: '20px / 28px, weight 600' },
    { name: 'body-lg', class: 'text-body-lg', description: '16px / 24px, weight 400' },
    { name: 'body-sm', class: 'text-body-sm', description: '14px / 20px, weight 400' },
    { name: 'code', class: 'text-code', description: '13px / 20px, weight 500' },
  ];

  return (
    <div className="p-8 space-y-8 bg-background text-foreground">
      <div>
        <h1 className="text-h1 mb-6">Design System Tokens</h1>
        
        <section className="mb-8">
          <h2 className="text-h2 mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className={`w-full h-16 rounded ${color.class} border border-gray-200`}
                ></div>
                <div className="text-body-sm">
                  <div className="font-medium">{color.name}</div>
                  <div className="text-gray-700">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-4">Typography Scale</h2>
          <div className="space-y-4">
            {typography.map((type) => (
              <div key={type.name} className="flex items-baseline gap-4">
                <div className="w-20 text-body-sm text-gray-700">{type.name}</div>
                <div className={type.class}>
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="text-body-sm text-gray-700 ml-auto">
                  {type.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-h2 mb-4">Interaction States</h2>
          <div className="space-y-4">
            <button className="px-4 py-2 bg-primary-500 text-white rounded ui-hover ui-pressed ui-focus">
              Hover me
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded ui-hover ui-pressed ui-focus">
              Secondary button
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded ui-disabled" disabled>
              Disabled button
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const meta: Meta<typeof TokenPreview> = {
  title: 'Design System/Token Preview',
  component: TokenPreview,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {};

export const Dark: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
