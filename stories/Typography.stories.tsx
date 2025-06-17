
import type { Meta, StoryObj } from '@storybook/react';
import { H1, H2, H3, BodyLg, BodySm, CodeText } from '@/components/mantine/Typography';

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TypographyScale: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <H1>Heading 1 - Main page titles</H1>
        <H2>Heading 2 - Section headers</H2>
        <H3>Heading 3 - Subsection headers</H3>
        
        <BodyLg>
          Body Large - This is the primary text size for important content. 
          It provides excellent readability and is used for main paragraphs and descriptions.
        </BodyLg>
        
        <BodySm>
          Body Small - This is used for secondary information, captions, and supporting text. 
          It's smaller but still maintains good readability.
        </BodySm>
        
        <div>
          <CodeText>const example = 'inline code text';</CodeText>
        </div>
      </div>
      
      <div className="space-y-2">
        <H3>Typography Hierarchy Example</H3>
        <BodyLg>
          This demonstrates how our typography components work together to create 
          a clear information hierarchy that guides the user's attention.
        </BodyLg>
        <BodySm>
          Supporting details and secondary information use the smaller body text 
          to maintain visual balance while ensuring all content remains accessible.
        </BodySm>
      </div>
    </div>
  ),
};

export const HeadingVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <H1>H1: 30px / 36px line height</H1>
      <H2>H2: 24px / 32px line height</H2>
      <H3>H3: 20px / 28px line height</H3>
    </div>
  ),
};

export const BodyTextVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <BodyLg>Body Large: 16px / 24px line height - Perfect for main content</BodyLg>
      <BodySm>Body Small: 14px / 20px line height - Great for supporting text</BodySm>
    </div>
  ),
};

export const DarkModeTypography: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-6 rounded-lg space-y-4">
      <H2 c="white">Typography in Dark Mode</H2>
      <BodyLg c="gray.2">
        Our typography components automatically adapt to dark mode, 
        ensuring proper contrast and readability.
      </BodyLg>
      <BodySm c="gray.4">
        Secondary text maintains appropriate contrast ratios for accessibility.
      </BodySm>
      <CodeText c="gray.1">const darkMode = true;</CodeText>
    </div>
  ),
};
