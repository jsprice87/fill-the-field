
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography system following the Fill the Field design guidelines with Inter font family.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Headings: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Our typography follows a consistent scale with proper hierarchy
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-h1 text-gray-900 dark:text-gray-50">Heading 1</h1>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                30px / 36px line height / 600 weight - Used for main page titles
              </p>
            </div>
            
            <div>
              <h2 className="text-h2 text-gray-900 dark:text-gray-50">Heading 2</h2>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                24px / 32px line height / 600 weight - Used for section titles
              </p>
            </div>
            
            <div>
              <h3 className="text-h3 text-gray-900 dark:text-gray-50">Heading 3</h3>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                20px / 28px line height / 600 weight - Used for subsection titles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const BodyText: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Body Text Styles</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Body text variations for different content types
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-body-lg text-gray-700 dark:text-gray-300">
                Body Large (16px / 24px / 400 weight) - This is the primary body text size used for most content. 
                It provides excellent readability and is comfortable for extended reading sessions.
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                Used for primary content and important information
              </p>
            </div>
            
            <div>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Body Small (14px / 20px / 400 weight) - Used for secondary information, captions, 
                metadata, and supporting text that doesn't need as much visual prominence.
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                Used for captions, metadata, and secondary information
              </p>
            </div>
            
            <div>
              <code className="text-code bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                Code text (13px / 20px / 500 weight) - Used for code snippets and technical references
              </code>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                Used for inline code, file paths, and technical content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Text Color Variations</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Semantic color usage for different text contexts
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 text-gray-900 dark:text-gray-50 mb-2">Primary Text Colors</h3>
              <div className="space-y-2">
                <p className="text-body-lg text-gray-900 dark:text-gray-50">Primary text - gray-900 (headings, important content)</p>
                <p className="text-body-lg text-gray-700 dark:text-gray-300">Secondary text - gray-700 (body content)</p>
                <p className="text-body-lg text-muted-foreground">Muted text - muted-foreground (supporting text)</p>
              </div>
            </div>

            <div>
              <h3 className="text-h3 text-gray-900 dark:text-gray-50 mb-2">Semantic Colors</h3>
              <div className="space-y-2">
                <p className="text-body-lg text-primary-500">Primary brand color - used for links and CTAs</p>
                <p className="text-body-lg text-error-500">Error text - used for error messages and warnings</p>
                <p className="text-body-lg text-success-500">Success text - used for positive feedback</p>
                <p className="text-body-lg text-warning-500">Warning text - used for caution messages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Typography in Context</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Examples of how typography works together in real layouts
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <article className="space-y-4">
            <header className="space-y-2">
              <h1 className="text-h1 text-gray-900 dark:text-gray-50">Getting Started with Fill the Field</h1>
              <p className="text-body-lg text-gray-600 dark:text-gray-400">
                Learn how to set up your first free trial funnel and start converting leads
              </p>
            </header>
            
            <div className="space-y-4">
              <h2 className="text-h2 text-gray-900 dark:text-gray-50">Quick Setup Guide</h2>
              <p className="text-body-lg text-gray-700 dark:text-gray-300">
                Setting up your funnel is straightforward. Follow these steps to get your first 
                trial bookings flowing in minutes.
              </p>
              
              <h3 className="text-h3 text-gray-900 dark:text-gray-50">Step 1: Configure Your Locations</h3>
              <p className="text-body-lg text-gray-700 dark:text-gray-300">
                Add your business locations where trials will take place. This helps prospects 
                find classes near them.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-50">Pro tip:</strong> Include accurate addresses 
                  and contact information to build trust with potential customers.
                </p>
              </div>
              
              <h3 className="text-h3 text-gray-900 dark:text-gray-50">Step 2: Create Your Class Schedule</h3>
              <p className="text-body-lg text-gray-700 dark:text-gray-300">
                Set up your trial class times and availability. Consider peak hours when 
                families are most likely to attend.
              </p>
              
              <code className="text-code bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100 block">
                Example: Monday 4:00 PM - 5:00 PM (Ages 6-10)
              </code>
            </div>
          </article>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Considerations</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Our typography follows WCAG AA guidelines for optimal accessibility
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 text-gray-900 dark:text-gray-50 mb-2">Contrast Ratios</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white dark:bg-gray-900 border rounded">
                  <p className="text-body-lg text-gray-900 dark:text-gray-50 mb-1">Gray-900 on white</p>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">Contrast ratio: 21:1 (AAA)</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 border rounded">
                  <p className="text-body-lg text-gray-700 dark:text-gray-300 mb-1">Gray-700 on white</p>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">Contrast ratio: 12.6:1 (AAA)</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-h3 text-gray-900 dark:text-gray-50 mb-2">Font Size Guidelines</h3>
              <ul className="space-y-2 text-body-lg text-gray-700 dark:text-gray-300">
                <li>• Minimum 14px for body text (body-sm)</li>
                <li>• 16px recommended for primary content (body-lg)</li>
                <li>• Clear hierarchy between heading levels</li>
                <li>• Sufficient line height for readability (1.5x minimum)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
