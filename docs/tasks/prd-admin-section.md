# PRD: Fill the Field Admin Section Complete Implementation

## Introduction/Overview

The Fill the Field admin section requires a complete overhaul to transform it from a partially-implemented interface into a fully functional platform administration system. Currently, the admin section has basic routing and placeholder components, but lacks real data population, user management functionality, payment integration, and proper UI consistency.

This feature will provide platform administrators with comprehensive tools to manage users (franchisees), monitor system analytics, handle transactions, invite new users, and maintain global platform settings. The admin section must support the multi-tenant architecture where each franchisee operates independently while being centrally managed.

**Problem Statement:** The current admin section is non-functional with hardcoded data, broken routing, and missing core administrative features, preventing effective platform management and growth.

**Goal:** Create a complete, production-ready admin interface that enables efficient platform administration, user management, financial oversight, and system monitoring.

## Goals

1. **Fix Critical Infrastructure Issues:** Resolve routing problems and populate dashboards with real data
2. **Achieve UI Consistency:** Migrate all shadcn/ui components to Mantine v8 for consistent design
3. **Enable Complete User Management:** Provide full CRUD operations for user accounts with advanced features
4. **Implement Invitation System:** Allow both admins and users to invite new members with referral tracking
5. **Establish Financial Management:** Integrate Stripe for subscription management and transaction oversight
6. **Provide System Insights:** Create comprehensive analytics and monitoring capabilities
7. **Support User Impersonation:** Enable admins to access user portals for support purposes

## User Stories

### Admin User Management
- As an admin, I want to view all franchisee accounts in a searchable, filterable table so I can efficiently manage the user base
- As an admin, I want to edit user account details (business info, contact details, settings) so I can keep records accurate
- As an admin, I want to delete user accounts with proper confirmation so I can remove inactive or problematic accounts
- As an admin, I want to reset user passwords so I can help users regain access to their accounts
- As an admin, I want to impersonate users (access their portal) so I can provide direct technical support

### Dashboard & Analytics
- As an admin, I want to see key platform metrics (total users, leads, bookings, revenue) on a dashboard so I can monitor platform health
- As an admin, I want to select different time periods for analytics so I can track growth trends and seasonal patterns
- As an admin, I want to view user growth metrics so I can understand acquisition patterns
- As an admin, I want to see aggregated data across all franchisees so I can understand total platform activity

### Invitation System
- As an admin, I want to send email invitations to prospective users so I can grow the platform
- As a franchisee, I want to invite other businesses with my referral code so I can earn referral credits
- As an invited user, I want to complete registration through a streamlined signup process so I can quickly start using the platform

### Financial Management
- As an admin, I want to view all subscription transactions across the platform so I can monitor revenue
- As an admin, I want to issue refunds and adjust billing so I can handle customer service issues
- As an admin, I want to see failed payment notifications so I can address billing problems proactively
- As an admin, I want to export transaction data so I can generate financial reports
- As a franchisee, I want to upgrade/downgrade my subscription plan so I can adjust my service level

### System Administration
- As an admin, I want to update global platform settings (Mapbox tokens, webhooks, support contact info) so I can maintain platform functionality
- As an admin, I want to monitor system performance and error logs so I can identify and resolve issues
- As an admin, I want to access system health metrics so I can ensure platform reliability

## Functional Requirements

### 1. Routing & Navigation
1.1. `/admin` URL must redirect to `/admin/dashboard`
1.2. All admin routes must load proper content without 404 errors
1.3. Admin sidebar navigation must highlight active routes correctly
1.4. Admin section must use consistent layout separate from portal layout

### 2. Dashboard Analytics
2.1. Dashboard must display real-time metrics: total users, total leads, total bookings, revenue
2.2. Dashboard must include user growth tracking with percentage changes
2.3. Dashboard must provide time period selector (Last 7 days, 30 days, 90 days, custom range)
2.4. Dashboard must aggregate data across all franchisees globally
2.5. Dashboard must display metrics in easy-to-read cards with loading states
2.6. Dashboard must handle data loading errors gracefully

### 3. User Management Enhancement
3.1. User management table must allow editing of franchisee details (business name, contact info, settings)
3.2. System must provide user deletion functionality with confirmation dialog and cascading cleanup
3.3. System must allow password reset for any user account
3.4. User management must include bulk actions for common operations
3.5. System must provide user impersonation capability with clear entry/exit flow
3.6. All user operations must include proper success/error feedback

### 4. Invitation System
4.1. System must allow admins to send email invitations to new users
4.2. System must allow franchisees to generate referral codes and send invitations
4.3. Invitation emails must include branded content and clear signup links
4.4. Invitation recipients must be directed to streamlined registration flow
4.5. System must track invitation status (sent, opened, completed)
4.6. Referral codes must be unique and trackable for future credit/incentive system

### 5. UI Migration & Consistency
5.1. All shadcn/ui components in admin section must be replaced with Mantine v8 equivalents
5.2. GlobalSettings.tsx must use Mantine Input, TextInput, Badge components instead of shadcn
5.3. All admin components must follow Mantine design system and theming
5.4. Admin section must use consistent spacing, typography, and color scheme
5.5. All form inputs must use Mantine form handling patterns

### 6. Transaction Management
6.1. System must display all subscription transactions in filterable table
6.2. Transaction table must include search by user, amount, date range, status
6.3. System must allow transaction exports in CSV/Excel format
6.4. Admins must be able to issue refunds through the interface
6.5. System must allow manual transaction adjustments and charges
6.6. Transaction details must include full payment history and metadata

### 7. Stripe Integration
7.1. System must integrate with Stripe for subscription management
7.2. System must support 3-tier subscription model: Free, Plus ($29/mo), Pro ($79/mo)
7.3. Free tier: 1 location, 5 classes; Plus tier: 3 locations, 25 classes + email automation; Pro tier: unlimited + advanced features
7.4. Users must be able to upgrade/downgrade subscriptions self-service
7.5. System must handle webhook events for payment status changes
7.6. System must provide Stripe customer portal integration
7.7. System must track failed payments and dunning management
7.8. System must generate invoices and payment confirmations

### 8. Global Settings Management
8.1. System must allow updating Mapbox public tokens
8.2. System must allow configuring webhook URLs and authentication
8.3. System must allow updating support contact information
8.4. Settings changes must be reflected immediately across the platform
8.5. Settings must include validation and error handling

### 9. System Monitoring
9.1. Admin dashboard must include system health indicators
9.2. System must provide error log access and monitoring
9.3. System must track performance metrics (response times, uptime)
9.4. System must alert on critical system issues
9.5. Monitoring data must be exportable for analysis

## Non-Goals (Out of Scope)

- **Multi-level admin permissions:** All admins have full access (no role hierarchy)
- **Advanced referral incentive system:** Referral tracking only, no automated credits yet
- **Custom subscription tiers:** Only the 3 predefined tiers (Free, Plus, Pro)
- **Advanced analytics/reporting:** Basic metrics only, no complex business intelligence
- **Multi-language admin interface:** English only
- **Mobile-optimized admin interface:** Desktop-first design
- **Real-time notifications:** Standard page refresh for updates
- **Advanced user segmentation:** Basic filtering only

## Design Considerations

- **Mantine v8 Components:** Use exclusively Mantine components following existing portal patterns
- **Consistent Layout:** Maintain visual consistency with portal section using similar spacing and typography
- **Data Tables:** Use Mantine DataTable component with sorting, filtering, and pagination
- **Forms:** Implement using react-hook-form with Mantine form components and Zod validation
- **Loading States:** Consistent loading indicators and skeleton screens
- **Error Handling:** User-friendly error messages with actionable feedback
- **Responsive Design:** Desktop-first but ensure mobile usability for emergency access

## Technical Considerations

- **Database Schema:** Extend existing Supabase schema for invitations, transactions, and system logs
- **Authentication:** Leverage existing ProtectedRoute with roleRequired="admin"
- **API Integration:** Use existing TanStack Query patterns for data fetching and caching
- **Stripe Integration:** Implement Stripe Customer Portal and webhook handling
- **Email Service:** Integrate with existing email service for invitation system
- **Data Migration:** Ensure existing GlobalSettings data is preserved during UI migration
- **Performance:** Implement proper caching and pagination for large datasets
- **Security:** Ensure admin impersonation has proper audit trails and session management

## Success Metrics

- **Functionality:** 100% of admin routes load and display real data
- **User Management:** Admins can successfully perform all CRUD operations on user accounts
- **UI Consistency:** 0 shadcn/ui components remaining in admin section
- **Invitation System:** Successful end-to-end invitation and signup flow
- **Payment Integration:** Successful subscription upgrades/downgrades and payment processing
- **Performance:** Dashboard loads within 2 seconds with real data
- **Error Reduction:** 90% reduction in admin-related support tickets

## Implementation Priority

### Phase 1: Critical Foundation (Week 1)
1. Fix `/admin` redirect routing issue
2. Migrate GlobalSettings.tsx from shadcn to Mantine components
3. Implement real dashboard metrics with database queries
4. Ensure all admin pages load content properly

### Phase 2: User Management (Week 2)
5. Complete user editing functionality
6. Implement user deletion with proper cascading
7. Add password reset capability
8. Implement user impersonation system

### Phase 3: Transaction System (Week 3)
9. Build transaction listing and management interface
10. Implement transaction exports and reporting
11. Add manual transaction adjustment capabilities

### Phase 4: Invitation System (Week 4)
12. Create admin invitation system with email integration
13. Implement franchisee referral code system
14. Build invitation tracking and management

### Phase 5: Stripe Integration (Week 5)
15. Research latest Stripe documentation via context7 mcp
16. Implement 3-tier subscription system
17. Add Stripe webhook handling
18. Create subscription management interface

## Open Questions

1. **Email Service:** What email service should be used for invitations? (Supabase Auth, SendGrid, etc.)
2. **Referral Credits:** What should be the value/type of referral incentives for future implementation?
3. **System Monitoring:** Should we integrate with external monitoring services (DataDog, etc.) or build custom?
4. **Transaction Export:** What specific fields are needed in transaction exports?
5. **Impersonation Audit:** Should admin impersonation actions be logged in a separate audit table?
6. **Failed Payment Flow:** What should be the specific dunning management process for failed payments?
7. **Performance Monitoring:** What specific metrics should be tracked for system health?

## Database Schema Extensions Required

```sql
-- Invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  referral_code TEXT,
  status TEXT DEFAULT 'sent',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System monitoring logs
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin actions audit
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```