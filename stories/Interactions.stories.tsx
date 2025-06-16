
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Download, Plus, Search, Settings } from 'lucide-react';
import { useState } from 'react';

const meta: Meta = {
  title: 'Design System/Interactions',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive elements and micro-interactions following the Fill the Field design system.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonInteractions: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    
    const handleLoadingClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <div className="space-y-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Button Micro-interactions</CardTitle>
            <p className="text-body-sm text-muted-foreground">
              Hover, focus, and press states with smooth transitions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-h3">Hover Effects</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default Hover</Button>
                <Button variant="secondary">Secondary Hover</Button>
                <Button variant="outline">Outline Hover</Button>
                <Button variant="ghost">Ghost Hover</Button>
                <Button variant="destructive">Destructive Hover</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-h3">Loading States</h3>
              <div className="flex flex-wrap gap-4">
                <Button loading={loading} onClick={handleLoadingClick}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
                <Button variant="outline" loading>
                  Loading Outline
                </Button>
                <Button variant="secondary" loading>
                  Loading Secondary
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-h3">Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Star className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

export const CardInteractions: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Card Interactions</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Interactive cards with hover effects and animations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card interactive>
              <CardHeader>
                <CardTitle className="text-body-lg">Interactive Card</CardTitle>
                <p className="text-body-sm text-muted-foreground">
                  Hover to see the lift effect
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm">This card responds to hover with smooth animations.</p>
              </CardContent>
            </Card>

            <Card interactive>
              <CardHeader>
                <CardTitle className="text-body-lg">Statistics Card</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-h2 font-bold text-primary-500">1,234</span>
                  <Badge variant="secondary">+12%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">Active users this month</p>
              </CardContent>
            </Card>

            <Card interactive>
              <CardHeader>
                <CardTitle className="text-body-lg">Action Card</CardTitle>
                <p className="text-body-sm text-muted-foreground">
                  Click anywhere to interact
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const InputInteractions: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1500);
    };

    return (
      <div className="space-y-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Input Interactions</CardTitle>
            <p className="text-body-sm text-muted-foreground">
              Focus states, loading indicators, and smooth transitions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-h3">Focus Effects</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input placeholder="Focus me for scale effect" />
                <Input placeholder="Another input to test" />
                <Input type="email" placeholder="Email with validation" />
                <Input type="password" placeholder="Password field" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-h3">Loading States</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  loading={loading} 
                  placeholder="Search with loading..." 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-h3">Error States</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input error placeholder="Input with error state" />
                <Input placeholder="Normal input for comparison" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Loading States & Animations</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Various loading indicators and skeleton screens
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-h3">Spinners</h3>
            <div className="flex items-center gap-6">
              <div className="loading-spinner h-6 w-6" />
              <div className="loading-spinner h-8 w-8" />
              <div className="loading-spinner h-10 w-10" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-h3">Pulse Animation</h3>
            <div className="space-y-3">
              <div className="loading-pulse h-4 w-3/4 rounded" />
              <div className="loading-pulse h-4 w-1/2 rounded" />
              <div className="loading-pulse h-4 w-2/3 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-h3">Shimmer Effect</h3>
            <div className="space-y-3">
              <div className="loading-shimmer h-4 w-full rounded" />
              <div className="loading-shimmer h-4 w-4/5 rounded" />
              <div className="loading-shimmer h-4 w-3/5 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-h3">Card Skeleton</h3>
            <Card>
              <CardHeader>
                <div className="loading-shimmer h-6 w-1/3 rounded" />
                <div className="loading-shimmer h-4 w-2/3 rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="loading-shimmer h-4 w-full rounded" />
                  <div className="loading-shimmer h-4 w-4/5 rounded" />
                  <div className="loading-shimmer h-4 w-3/5 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const AnimationShowcase: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <div className="space-y-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Animation Examples</CardTitle>
            <p className="text-body-sm text-muted-foreground">
              Entry and exit animations with smooth transitions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={() => setVisible(!visible)}>
                  Toggle Animation
                </Button>
              </div>
              
              {visible && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card interactive className="fade-in">
                    <CardHeader>
                      <CardTitle className="text-body-lg">Fade In</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body-sm">This card fades in smoothly</p>
                    </CardContent>
                  </Card>

                  <Card interactive className="slide-up">
                    <CardHeader>
                      <CardTitle className="text-body-lg">Slide Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body-sm">This card slides up from below</p>
                    </CardContent>
                  </Card>

                  <Card interactive className="scale-in">
                    <CardHeader>
                      <CardTitle className="text-body-lg">Scale In</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body-sm">This card scales in smoothly</p>
                    </CardContent>
                  </Card>

                  <Card interactive>
                    <CardHeader>
                      <CardTitle className="text-body-lg">Hover Effects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body-sm">Hover to see the lift animation</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

export const AccessibilityConsiderations: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility & Reduced Motion</CardTitle>
          <p className="text-body-sm text-muted-foreground">
            Respecting user preferences for reduced motion
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-h3">Motion Preferences</h3>
            <p className="text-body-lg">
              All animations respect the <code className="text-code bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">prefers-reduced-motion</code> media query.
              Users who have enabled reduced motion in their system settings will see minimal animations.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-body-lg font-medium mb-2">Accessibility Features:</h4>
              <ul className="space-y-1 text-body-sm">
                <li>• Focus indicators are clearly visible</li>
                <li>• Color contrast meets WCAG AA standards</li>
                <li>• Interactive elements have minimum 44px touch targets</li>
                <li>• Animations are disabled for users with motion sensitivity</li>
                <li>• Loading states provide clear feedback</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-h3">Test Interactive Elements</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Focus me with Tab</Button>
              <Button variant="outline">Another focusable button</Button>
              <Input placeholder="Tab to focus this input" />
            </div>
            <p className="text-body-sm text-muted-foreground">
              Use keyboard navigation (Tab, Enter, Space) to test accessibility features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
