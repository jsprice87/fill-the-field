# Tasks: Admin Section Complete Implementation

Based on PRD: Fill the Field Admin Section Complete Implementation

## Relevant Files

- `src/nav-items.tsx` - Add `/admin` redirect route to dashboard (UPDATED - Added admin redirect, switched to AdminLayout)
- `src/pages/admin/Dashboard.tsx` - Replace placeholder dashboard with real metrics (UPDATED - Now uses real data)
- `src/pages/admin/UserManagement.tsx` - Enhance existing user management with CRUD operations
- `src/pages/admin/UserManagement.test.tsx` - Unit tests for user management functionality
- `src/pages/admin/Transactions.tsx` - Create new transaction management page
- `src/pages/admin/Transactions.test.tsx` - Unit tests for transaction management
- `src/pages/admin/GlobalSettings.tsx` - Migrate from shadcn to Mantine components (UPDATED - Migrated to Mantine)
- `src/pages/admin/GlobalSettings.test.tsx` - Unit tests for global settings
- `src/pages/admin/Invitations.tsx` - Create new invitation management page
- `src/pages/admin/Invitations.test.tsx` - Unit tests for invitation system
- `src/components/admin/InviteUserModal.tsx` - Modal component for sending invitations
- `src/components/admin/UserEditModal.tsx` - Modal component for editing user details
- `src/components/admin/UserDeleteConfirmation.tsx` - Confirmation dialog for user deletion
- `src/components/admin/ImpersonationBanner.tsx` - Banner component for impersonation mode
- `src/components/admin/DashboardMetrics.tsx` - Dashboard metrics cards component (CREATED)
- `src/components/admin/TimePeriodSelector.tsx` - Time period selector component (CREATED)
- `src/components/admin/TransactionTable.tsx` - Transaction listing table component
- `src/hooks/useAdminDashboard.ts` - Hook for dashboard analytics data (CREATED)
- `src/hooks/useAdminUserActions.ts` - Hook for user management operations
- `src/hooks/useAdminTransactions.ts` - Hook for transaction data and operations
- `src/hooks/useInvitations.ts` - Hook for invitation management
- `src/hooks/useStripeIntegration.ts` - Hook for Stripe operations
- `src/hooks/useSystemMonitoring.ts` - Hook for system health and monitoring
- `src/layout/AdminLayout.tsx` - Dedicated admin layout component (CREATED)
- `src/utils/adminHelpers.ts` - Utility functions for admin operations
- `src/utils/stripeHelpers.ts` - Utility functions for Stripe integration
- `supabase/migrations/add_admin_tables.sql` - Database migration for new admin tables
- `supabase/functions/send-invitation/index.ts` - Edge function for sending invitations
- `supabase/functions/stripe-webhook/index.ts` - Edge function for Stripe webhook handling

### Notes

- Unit tests should be placed alongside component files they are testing
- Use `npm run test` to run all tests, or `npm run test [filename]` for specific test files
- Database migrations should be created using Supabase CLI: `supabase migration new [migration_name]`
- Edge functions are deployed using: `supabase functions deploy [function_name]`

## Tasks

- [x] 1.0 Fix Critical Infrastructure & UI Migration
  - [x] 1.1 Add `/admin` redirect route in nav-items.tsx to redirect to `/admin/dashboard`
  - [x] 1.2 Create dedicated AdminLayout component to replace DashboardLayout usage for admin routes
  - [x] 1.3 Update all admin route definitions to use AdminLayout instead of DashboardLayout
  - [x] 1.4 Migrate GlobalSettings.tsx from shadcn/ui components to Mantine v8 components
  - [x] 1.5 Replace shadcn Input, Label, Textarea, Badge with Mantine TextInput, Text, Textarea, Badge
  - [x] 1.6 Ensure all admin pages load without 404 errors and display proper content
  - [x] 1.7 Verify admin sidebar navigation highlights active routes correctly

- [x] 2.0 Implement Real Dashboard Analytics
  - [x] 2.1 Create useAdminDashboard hook to fetch real analytics data
  - [x] 2.2 Add database queries for total users, leads, bookings across all franchisees
  - [x] 2.3 Implement user growth tracking with percentage changes calculation
  - [x] 2.4 Create time period selector component (7 days, 30 days, 90 days, custom range)
  - [x] 2.5 Build DashboardMetrics component with Mantine cards and loading states
  - [x] 2.6 Replace hardcoded dashboard values with real data from useAdminDashboard hook
  - [x] 2.7 Add revenue metrics calculation and display
  - [x] 2.8 Implement error handling for dashboard data loading failures

- [ ] 3.0 Complete User Management System
  - [ ] 3.1 Create useAdminUserActions hook for user CRUD operations
  - [ ] 3.2 Build UserEditModal component with Mantine form components and Zod validation
  - [ ] 3.3 Implement user editing functionality (business name, contact info, settings)
  - [ ] 3.4 Create UserDeleteConfirmation component with proper confirmation dialog
  - [ ] 3.5 Implement user deletion with cascading cleanup (leads, bookings, etc.)
  - [ ] 3.6 Add password reset functionality for user accounts
  - [ ] 3.7 Implement bulk actions for user management operations
  - [ ] 3.8 Create user impersonation system with ImpersonationBanner component
  - [ ] 3.9 Add impersonation entry/exit flow with proper session management
  - [ ] 3.10 Implement audit logging for all admin user actions
  - [ ] 3.11 Add success/error feedback for all user operations

- [ ] 4.0 Build Transaction Management Interface
  - [ ] 4.1 Create database migration for transactions table if not exists
  - [ ] 4.2 Create useAdminTransactions hook for transaction data and operations
  - [ ] 4.3 Build Transactions page with Mantine DataTable component
  - [ ] 4.4 Implement transaction filtering by user, amount, date range, status
  - [ ] 4.5 Add transaction search functionality
  - [ ] 4.6 Create transaction export functionality (CSV/Excel format)
  - [ ] 4.7 Implement refund issuance through admin interface
  - [ ] 4.8 Add manual transaction adjustment and charge capabilities
  - [ ] 4.9 Create transaction detail view with full payment history
  - [ ] 4.10 Add transaction status tracking and updates

- [ ] 5.0 Create Invitation System with Referral Tracking
  - [ ] 5.1 Create database migration for invitations table
  - [ ] 5.2 Create useInvitations hook for invitation management
  - [ ] 5.3 Build send-invitation Supabase edge function for email delivery
  - [ ] 5.4 Create InviteUserModal component for admin invitation sending
  - [ ] 5.5 Implement franchisee referral code generation and management
  - [ ] 5.6 Build Invitations page for tracking invitation status
  - [ ] 5.7 Create invitation email templates with branded content
  - [ ] 5.8 Implement streamlined registration flow for invited users
  - [ ] 5.9 Add invitation status tracking (sent, opened, completed)
  - [ ] 5.10 Integrate referral code system for future credit/incentive tracking

- [ ] 6.0 Integrate Stripe Payment System
  - [ ] 6.1 Research latest Stripe documentation and best practices
  - [ ] 6.2 Create useStripeIntegration hook for payment operations
  - [ ] 6.3 Implement 3-tier subscription model (Free, Plus $29/mo, Pro $79/mo)
  - [ ] 6.4 Set up Stripe product and price configurations
  - [ ] 6.5 Create stripe-webhook Supabase edge function for webhook handling
  - [ ] 6.6 Implement subscription upgrade/downgrade self-service interface
  - [ ] 6.7 Integrate Stripe Customer Portal for user billing management
  - [ ] 6.8 Add failed payment tracking and dunning management
  - [ ] 6.9 Implement invoice generation and payment confirmations
  - [ ] 6.10 Add subscription status tracking and plan limit enforcement
  - [ ] 6.11 Create subscription management interface in admin panel

- [ ] 7.0 Implement System Monitoring & Health Checks
  - [ ] 7.1 Create database migration for system_logs and admin_actions tables
  - [ ] 7.2 Create useSystemMonitoring hook for health metrics
  - [ ] 7.3 Implement system health indicators on admin dashboard
  - [ ] 7.4 Add error log access and monitoring interface
  - [ ] 7.5 Create performance metrics tracking (response times, uptime)
  - [ ] 7.6 Implement critical system issue alerting
  - [ ] 7.7 Add monitoring data export functionality
  - [ ] 7.8 Create admin action audit trail system
  - [ ] 7.9 Implement session management for admin impersonation
  - [ ] 7.10 Add system status page for operational monitoring