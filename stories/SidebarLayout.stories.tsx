
import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const queryClient = new QueryClient();

const SidebarLayoutDemo = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mx-auto max-w-app space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-h2 mb-4">Responsive Sidebar Layout</h2>
                <div className="space-y-4 text-body-lg">
                  <p>This sidebar demonstrates:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Desktop (≥1024px):</strong> 240px wide with text + icon</li>
                    <li><strong>Tablet (768-1023px):</strong> 72px icon-only mode</li>
                    <li><strong>Mobile (&lt;768px):</strong> Collapsible drawer</li>
                    <li><strong>Dark mode toggle</strong> in the footer</li>
                    <li><strong>Keyboard accessible</strong> with proper ARIA labels</li>
                    <li><strong>Proper z-index layering</strong> (sidebar: 50, header: 20, content: 10)</li>
                  </ul>
                  <p>Try resizing the viewport or toggling dark mode to see the responsive behavior!</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-lg border p-4">
                    <h3 className="text-h3 mb-2">Card {i}</h3>
                    <p className="text-body-sm text-muted-foreground">
                      Sample content to demonstrate the layout and spacing.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const meta: Meta<typeof SidebarLayoutDemo> = {
  title: 'Layout/Sidebar Layout',
  component: SidebarLayoutDemo,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrowserRouter>
            <Story />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <BrowserRouter>
            <div className="dark">
              <Story />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
};

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrowserRouter>
            <SidebarProvider defaultOpen={false}>
              <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                <SidebarInset className="flex flex-col">
                  <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-lg font-semibold">Collapsed Sidebar</h1>
                  </header>
                  <main className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="mx-auto max-w-app">
                      <div className="bg-card rounded-lg border p-6">
                        <h2 className="text-h2 mb-4">Collapsed State</h2>
                        <p className="text-body-lg">
                          The sidebar can be collapsed to show only icons with tooltips.
                        </p>
                      </div>
                    </div>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
};
