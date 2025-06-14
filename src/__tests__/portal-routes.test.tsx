
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import PortalDashboard from '@/pages/portal/Dashboard';
import PortalBookings from '@/pages/portal/Bookings';

// Mock the hooks
vi.mock('@/hooks/useFranchiseeData', () => ({
  useFranchiseeData: () => ({
    data: { id: 'test-id', slug: 'test-slug' },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useLeadStats', () => ({
  useLeadStats: () => ({
    data: { totalLeads: 0, conversionRate: 0, monthlyGrowth: 0 },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useBookings', () => ({
  useBookings: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useLocations', () => ({
  useLocations: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useBookingsSearch', () => ({
  useBookingsSearch: () => ({
    searchTerm: '',
    searchQuery: '',
    filteredBookings: [],
    handleSearchChange: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Portal Routes', () => {
  it('renders Portal Dashboard content', () => {
    renderWithProviders(<PortalDashboard />);
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders Portal Bookings content', () => {
    renderWithProviders(<PortalBookings />);
    expect(screen.getByRole('heading', { name: /bookings/i })).toBeInTheDocument();
  });
});
