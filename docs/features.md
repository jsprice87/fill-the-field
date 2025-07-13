# 🚀 Feature Requests & Enhancements

> **Last Updated:** 30 Jun 2025  
> **Active Features:** 5 | **Completed:** 8 | **Backlog:** 1

---

## 🔮 Planned Features

| ID | Title | Priority | Complexity | Assignee | Target Version |
|----|-------|----------|------------|----------|----------------|
| #6 | Enhanced notification types & end-of-day summaries | 🟡 Medium | 🔴 High | unassigned | v1.0.0 |
| #7 | Collapsible portal/admin sidebars | 🟢 Low | 🟡 Medium | unassigned | v0.9.5 |
| #10 | Remove redundant business info from profile page | 🟢 Low | 🟡 Medium | unassigned | v0.9.5 |
| #12 | Add bulk actions to locations and classes tables | 🟢 Low | 🟡 Medium | unassigned | v0.9.8 |
| #13 | Add date range and age range display to find-classes page | 🟡 Medium | 🟡 Medium | completed | v0.9.8 |
| #15 | Admin section data population and functionality | 🔴 Critical | 🟠 High | unassigned | v0.9.9 |
| #16 | Location Details mini-map integration | 🟡 Medium | 🟡 Medium | completed | v0.9.9 |
| #17 | Location-specific class management interface | 🟡 Medium | 🟡 Medium | completed | v0.9.9 |

---

## 📋 Backlog Features

| ID | Title | Priority | Complexity | Notes |
|----|-------|----------|------------|-------|
| #8 | Multi-user business account access | 📋 Backlog | 🔴 High | Future roadmap feature |

---

## ✅ Completed Features

| ID | Title | Completion Date | Version | Commit |
|----|-------|-----------------|---------|--------|
| #1 | Enhanced Lead Details page with editing capabilities | 2025-06-26 | v0.9.3 | Multiple commits |
| #4 | CC Emails field in notifications section | 2025-06-27 | v0.9.3 | 32d4d2e |
| #5 | Optional language requirement setting | 2025-06-27 | v0.9.3 | 32d4d2e |
| #2 | "Add Classes" button in Locations table actions | 2025-06-30 | v0.9.3 | current |
| #3 | Enhanced Booking Restrictions with radio button logic | 2025-06-30 | v0.9.4 | current |
| #9 | Profile password management | 2025-06-30 | v0.9.6 | current |
| #11 | Color-coded lead status badges with dropdown functionality | 2025-06-30 | v0.9.7 | current |
| #13 | Add date range and age range display to find-classes page | 2025-06-30 | v0.9.8 | current |

---

## 📋 Feature Details

<details>
<summary><strong>Feature #1:</strong> Enhanced Lead Details page with editing capabilities</summary>

### Description
Enhance the existing Lead Details page to become a comprehensive lead management interface with full editing capabilities, contact actions, and note-taking functionality.

### Current State
- Basic Lead Details page exists at `/portal/leads/:leadId`
- Shows lead information and basic details
- "View Details" and "Edit Lead" actions both navigate to the same page

### Proposed Enhancements
1. **Status Editing**: Add ability to change lead status directly from the details page
2. **Notes Section**: Add section for adding/viewing timestamped notes about the lead
3. **Contact Actions**: Add quick action buttons for calling/emailing the lead
4. **Related Data**: Display associated bookings, participants, and class interests
5. **Activity Timeline**: Show chronological history of status changes, notes, and interactions

### Technical Requirements
- Add inline status editing component
- Create notes CRUD functionality with timestamps
- Implement activity log/timeline component
- Add contact action buttons with proper tel:/mailto: links
- Ensure all changes invalidate relevant cache queries

### Acceptance Criteria
- [ ] Can edit lead status from details page
- [ ] Can add timestamped notes visible to user later
- [ ] Quick contact buttons work properly
- [ ] Shows related bookings and participants
- [ ] Activity timeline shows all interactions

### Priority: Medium
- **Business Value**: High - improves lead management workflow
- **Development Effort**: Medium - requires several new components
- **Dependencies**: None

### Status: `COMPLETED` ✅ 2025-06-26

**Implementation Summary:**
1. **LeadDetailsHeader Component** - Complete lead information display with status selector and quick action buttons
2. **LeadBookingsSection Component** - Booking management with edit/cancel functionality via modal
3. **EditBookingModal Component** - Cascading dropdowns (Location → Class → Booking Date) with RLS policy fixes
4. **LeadNotesSection Component** - Note creation, editing, deletion with timestamps
5. **Database Integration** - Complete hooks for bookings, notes, and status management

**Key Technical Achievements:**
- Full CRUD operations for lead notes with timestamps
- Complex booking editing with schedule date generation
- Solved z-index layering issues for modal dropdowns
- Implemented Row Level Security policies for booking updates
- Comprehensive status management with manual override capability

**Files Created/Modified:**
- Created: `LeadDetailsHeader.tsx`, `LeadBookingsSection.tsx`, `EditBookingModal.tsx`, `LeadNotesSection.tsx`
- Created: `useLeadBookings.ts`, `useLeadNotes.ts`, `useUpdateBooking.ts` hooks
- Modified: `LeadDetail.tsx` for three-section layout integration
- Database: Added RLS policies for bookings table

</details>

<details>
<summary><strong>Feature #2:</strong> "Add Classes" button in Locations table actions</summary>

### Description
Add an "Add Classes" action button to the Locations table row menu that navigates directly to the Add Classes page with the location pre-selected.

### Current State
- Locations table has Edit, Archive/Unarchive, and Delete actions
- Add Classes page exists but requires manual location selection
- No direct link from location to class creation

### Proposed Enhancement
Add "Add Classes" menu item to TableRowMenu that:
1. Navigates to the Add Classes page
2. Pre-selects the clicked location in the location dropdown
3. Streamlines workflow for adding classes to specific locations

### Technical Requirements
- Add new action to TableRowMenu component
- Modify Add Classes page to accept location ID parameter
- Update routing to support pre-selected location
- Ensure location selection is properly populated

### Implementation Details
- Update `TableRowMenu` component with new action prop
- Navigate to `/portal/classes/add?location=${locationId}`
- Modify Add Classes form to read and pre-select location from URL params

### Acceptance Criteria
- [ ] "Add Classes" button appears in Locations table actions
- [ ] Clicking button navigates to Add Classes page
- [ ] Location is pre-selected in the form
- [ ] User can still change location if needed
- [ ] Form functions normally after pre-selection

### Priority: Low
- **Business Value**: Medium - improves workflow efficiency
- **Development Effort**: Low - simple navigation enhancement
- **Dependencies**: None

</details>

<details>
<summary><strong>Feature #3:</strong> Enhanced Booking Restrictions with radio button logic</summary>

### Description
Enhance the booking restrictions setting in `/portal/settings` to provide more granular control over lead booking availability with intuitive radio button options.

### Current State
- Settings page has "Maximum Days Ahead of Booking" with simple number input
- Logic is basic: only show classes within X days from today
- No consideration for holiday gaps or class availability patterns

### Proposed Enhancement
Replace current input with radio button selection:

**Option 1: "Next Available Only"**
- Allows leads to book only the next available class for their location
- Handles holiday gaps automatically (could be weeks away if needed)
- Ensures leads always get the earliest possible booking

**Option 2: "Maximum Number of Days Away"** 
- Current logic but with better UX via radio selection
- Shows all classes within the specified day window
- Maintains existing flexible booking window behavior

### Technical Requirements
- Modify booking restrictions settings component to use radio buttons
- Update booking flow logic to handle both restriction types
- Ensure database schema supports the new restriction type
- Update existing franchisee settings migration if needed

### Implementation Details
- Replace number input with radio button group in settings
- Add new field to franchisee settings: `booking_restriction_type` (enum: 'next_available', 'max_days')
- Update booking availability queries to check restriction type
- Maintain backward compatibility with existing "max days" settings

### Acceptance Criteria
- [ ] Radio buttons replace current number input in settings
- [ ] "Next Available Only" shows only earliest available class
- [ ] "Maximum Days Away" maintains current behavior with improved UX
- [ ] Settings save and load correctly for both options
- [ ] Booking flow respects the selected restriction type
- [ ] Existing franchisee settings migrate properly

### Priority: Medium
- **Business Value**: Medium - improves booking flow control and lead experience
- **Development Effort**: Medium - requires booking logic changes and settings UI update
- **Dependencies**: None

</details>

<details>
<summary><strong>Feature #4:</strong> CC Emails field in notifications section</summary>

### Description
Add a CC Emails field to the notifications section of `/portal/settings` to allow sending notifications to multiple email addresses.

### Status: ✅ COMPLETED (2025-06-27)

### Implementation Summary
Successfully added CC Emails functionality to portal settings:
1. **Settings UI** - Added CC Emails text input field in notifications section
2. **Database Integration** - Field saves to franchisee settings table
3. **Validation** - Email format validation for multiple comma-separated addresses
4. **Persistence** - Settings load and save correctly with other notification preferences

### Technical Details
- Added `ccEmails` state management to Settings.tsx
- Integrated with existing settings save/load functions
- Email validation supports multiple addresses separated by commas
- Consistent with other notification settings patterns

### Files Modified
- `src/pages/portal/Settings.tsx` - Added CC emails input field and state management

### Business Value
- **Medium**: Allows franchisees to include multiple stakeholders in notifications
- **Workflow Improvement**: Reduces manual forwarding of important business notifications
- **Flexibility**: Supports teams and partners who need visibility into lead/booking activity

</details>

<details>
<summary><strong>Feature #5:</strong> Optional language requirement setting</summary>

### Description
Make the child language information request optional for users by adding a checkbox setting in `/portal/settings`.

### Status: ✅ COMPLETED (2025-06-27)

### Implementation Summary
Successfully implemented optional language requirement:
1. **Settings Checkbox** - Added "Require Language Information" toggle in portal settings
2. **Conditional Rendering** - Language question only appears when setting is enabled
3. **Default Behavior** - Maintains existing behavior (required) for backward compatibility
4. **State Management** - Setting persists and loads correctly with other franchisee preferences

### Technical Details
- Added `requireLanguageInfo` checkbox to Settings.tsx
- Modified `ParentGuardianForm.tsx` to conditionally render language section
- Uses `settings?.require_language_info !== 'false'` for default-true behavior
- Integrated with existing settings save/load infrastructure

### Files Modified
- `src/pages/portal/Settings.tsx` - Added language requirement checkbox
- `src/components/booking/ParentGuardianForm.tsx` - Made language section conditional

### Business Value
- **Medium**: Reduces form friction for franchisees who don't need language information
- **Flexibility**: Allows customization based on business needs and target demographics
- **UX Improvement**: Shorter forms can improve booking completion rates

</details>

<details>
<summary><strong>Feature #6:</strong> Enhanced notification types & end-of-day summaries</summary>

### Description
Add advanced notification capabilities including time-based notifications, end-of-day summaries, and day-of trial class reminders.

### Current State
- Basic webhook notifications for new leads and bookings exist
- Limited to immediate notifications only
- No time-based or summary notification options

### Proposed Enhancement
Expand notification system with:

**1. End-of-Day Summary Emails**
- Daily digest including all bookings and new leads from the day
- Option to receive individual notifications OR just daily summary
- Configurable send time (e.g., 6 PM daily)

**2. Day-Of Trial Class Reminders**
- Automatic reminders sent on the day of trial classes
- Includes class details, location, and contact information
- Reduces no-shows and improves customer experience

**3. Notification Preferences**
- Choose between individual notifications vs. summary only
- Configure timing for various notification types
- Granular control over which events trigger notifications

### Technical Requirements
- Extend webhook system to support scheduled/delayed notifications
- Add notification scheduling infrastructure
- Expand settings UI for notification preferences
- Implement email template system for different notification types
- Add background job processing for scheduled notifications

### Implementation Complexity: 🔴 High
- Requires significant backend infrastructure changes
- Needs scheduling system (cron jobs or similar)
- Email template management system
- Extensive testing for reliability

### Priority: 🟡 Medium
- **Business Value**: High - improves customer experience and business operations
- **Development Effort**: High - complex system with multiple moving parts
- **Target Version**: v1.0.0

</details>

<details>
<summary><strong>Feature #7:</strong> Collapsible portal/admin sidebars</summary>

### Description
Make the `/portal/` and `/admin/` sidebars collapsible with slide animation to maximize content area and improve mobile experience.

### Current State
- Sidebars are always expanded taking fixed width
- No option to collapse for more content space
- Mobile experience could be improved with collapsible navigation

### Proposed Enhancement
Add collapsible functionality:
1. **Collapse Button** - Toggle button in sidebar header
2. **Slide Animation** - Smooth CSS transition for expand/collapse
3. **Icon Mode** - When collapsed, show icons only with tooltips
4. **State Persistence** - Remember collapsed/expanded state in localStorage
5. **Mobile Responsive** - Auto-collapse on smaller screens

### Technical Requirements
- Modify sidebar components for both portal and admin
- Add state management for collapsed/expanded state
- Implement CSS transitions for smooth animation
- Add localStorage for state persistence
- Ensure responsive behavior on mobile

### Priority: 🟢 Low
- **Business Value**: Low-Medium - UX improvement
- **Development Effort**: Medium - animation and state management
- **Target Version**: v0.9.5

</details>

<details>
<summary><strong>Feature #8:</strong> Multi-user business account access</summary>

### Description
Allow multiple users to login and access specific business accounts, enabling team collaboration for franchisees.

### Status: 📋 BACKLOG - Future roadmap feature

### Proposed Enhancement
Implement user role management system:
1. **Account Ownership** - Original account creator becomes admin
2. **User Invitations** - Admins can invite team members via email
3. **Role-Based Permissions** - Different access levels (Admin, Manager, Viewer)
4. **Account Switching** - Users can switch between multiple business accounts
5. **Audit Trail** - Track which user performed which actions

### Technical Requirements
- Major authentication system overhaul
- User roles and permissions database schema
- Invitation system with email verification
- Multi-tenancy support in all queries
- Comprehensive security review

### Complexity: 🔴 High
- **Scope**: Epic-level feature requiring multiple sprints
- **Security Implications**: Requires thorough security review
- **Database Changes**: Significant schema modifications needed

### Priority: 📋 Backlog
- **Business Value**: High - enables team collaboration
- **Development Effort**: Epic - multiple weeks of development
- **Dependencies**: Security audit, UX design, database migration strategy

</details>

<details>
<summary><strong>Feature #9:</strong> Profile password management</summary>

### Description
Add password management functionality to the profile page, allowing users to change their account passwords securely.

### Current State
- No password management available in portal
- Users must rely on external auth provider password reset
- Profile page lacks essential account security features

### Proposed Enhancement
Add comprehensive password management:
1. **Change Password Form** - Current password + new password + confirmation
2. **Security Validation** - Strong password requirements
3. **Confirmation Process** - Email confirmation for password changes
4. **Session Management** - Force re-login after password change
5. **Audit Logging** - Log password change events for security

### Technical Requirements
- Integrate with Supabase Auth password change API
- Add password strength validation
- Implement secure form handling
- Add email confirmation workflow
- Update user session management

### Priority: 🔴 High
- **Business Value**: High - essential security feature
- **User Request**: High priority per user feedback
- **Security**: Important for account security
- **Target Version**: v0.9.6

### Implementation Details
- Add password change form to profile page
- Use Supabase `updateUser()` API for password changes
- Implement proper validation and error handling
- Add success confirmation and security notifications

</details>

<details>
<summary><strong>Feature #10:</strong> Remove redundant business info from profile page</summary>

### Description
Remove the "Business Information" section from `/portal/profile/` page since it duplicates functionality already available in `/portal/settings/`.

### Current State
- Business information appears in both profile and settings pages
- Creates confusion about which location to edit business details
- Potential for data inconsistency between the two locations

### Proposed Enhancement
1. **Remove Duplication** - Remove business info section from profile page
2. **Migration Check** - Ensure all profile business info functionality exists in settings
3. **Redirect Logic** - Add link/button to direct users to settings for business info
4. **Data Consistency** - Verify all components pull from same data source

### Prerequisites
- Audit both pages to ensure no functionality loss
- Verify all business info fields exist in settings
- Check if any components specifically rely on profile business info

### Priority: 🟢 Low
- **Business Value**: Low - cleanup and consistency improvement
- **Development Effort**: Medium - requires careful migration and testing
- **Target Version**: v0.9.5

### Technical Requirements
- Remove business info section from profile page
- Update any components that reference profile business info
- Add navigation guidance to settings page
- Ensure data consistency across the application

</details>

<details>
<summary><strong>Feature #11:</strong> Color-coded lead status badges with dropdown functionality</summary>

### Description
Implement color-coded lead status badges that function as interactive dropdown menus, providing visual consistency and streamlined status management across the portal.

### Current State
- Lead status displays vary across different portal locations
- Status changes require separate dropdown menus or buttons
- No consistent color coding for status recognition
- UI can feel cluttered with separate badges and menus

### Proposed Enhancement
Create unified status badge system with:

**1. Color-Coded Status Badges**
- Consistent color scheme for all lead statuses
- Immediate visual recognition of lead states
- Used consistently across all portal locations (tables, details, etc.)

**2. Interactive Badge Dropdowns**
- Badge itself is clickable and opens status change menu
- No separate dropdown button needed
- Minimizes UI clutter by combining display and action

**3. Status Color Scheme Suggestions**
- **New**: 🔵 Blue - Fresh leads
- **Contacted**: 🟡 Yellow - In progress
- **Booked Upcoming**: 🟢 Green - Success state
- **Follow-up**: 🟠 Orange - Needs attention
- **Not Interested**: 🔴 Red - Closed negative
- **Archived**: ⚫ Gray - Inactive

### Technical Requirements
- Create reusable StatusBadge component
- Implement dropdown functionality within badge
- Ensure consistent styling across all portal pages
- Update all existing status displays to use new component
- Maintain accessibility for dropdown interactions

### Implementation Details
- Replace existing status displays in LeadsTable, Lead Details, etc.
- Badge component accepts current status and onChange callback
- Dropdown shows all available status options with colors
- Smooth transitions and hover states for professional feel
- Keyboard navigation support for accessibility

### Acceptance Criteria
- [ ] All lead statuses use consistent color coding
- [ ] Status badges are clickable and open dropdown menu
- [ ] Same badge component used across all portal locations
- [ ] No separate status dropdown buttons needed
- [ ] Color scheme is intuitive and professional
- [ ] Accessibility standards met for dropdown interactions
- [ ] Status changes work seamlessly from badge clicks

### Priority: 🟡 Medium
- **Business Value**: Medium - improves workflow efficiency and visual consistency
- **UX Impact**: High - cleaner interface with better visual recognition
- **Development Effort**: Medium - component creation and system-wide updates
- **Target Version**: v0.9.7

### Design Principles
- **Minimize Clutter**: Badge IS the menu, not badge + menu
- **Visual Consistency**: Same colors and styling everywhere
- **Immediate Recognition**: Colors provide instant status understanding
- **Streamlined Workflow**: One click to view and change status

</details>

<details>
<summary><strong>Feature #13:</strong> Add date range and age range display to find-classes page</summary>

### Description
Enhance the FindClasses page to display comprehensive class information including age ranges, date ranges, class counts, and sample schedules for each location to help parents make informed decisions.

### Status: ✅ COMPLETED (2025-06-30)

### Implementation Summary
Successfully enhanced the FindClasses page with comprehensive class information:
1. **Class Data Integration** - Added getLocationClassInfo function to fetch and aggregate class data
2. **Age Range Display** - Shows min-max age ranges with smart formatting (e.g., "3-7 years", "All ages")
3. **Date Range Display** - Shows class availability periods with proper date formatting
4. **Class Count** - Displays total number of available classes per location
5. **Schedule Previews** - Shows sample class schedules with colored badges (limited to 3 with overflow indicator)

### Technical Implementation
- **LocationClassInfo Interface** - New interface for structured class data aggregation
- **Database Queries** - Enhanced queries to fetch classes, schedules, and calculate age/date ranges
- **Helper Functions** - formatAgeRange() and formatDateRange() for consistent display formatting
- **Enhanced UI** - Added colored icons and badges for better visual hierarchy
- **Class Information Section** - New bordered section in location cards with comprehensive class details

### Key Features Added
1. **Smart Age Range Formatting**:
   - "All ages" when no restrictions
   - "Up to X years" for max-only restrictions
   - "X+ years" for min-only restrictions
   - "X-Y years" for full ranges
   - "X years" for single age requirements

2. **Flexible Date Range Display**:
   - "Ongoing" for open-ended classes
   - "From [date]" for start-only periods
   - "Until [date]" for end-only periods
   - "[start] - [end]" for full date ranges

3. **Enhanced Location Cards**:
   - Class count with user/group icon
   - Age range with user-check icon
   - Date range with calendar icon
   - Schedule badges with clock icon
   - "+X more" indicator for overflow schedules

### Files Modified
- `src/pages/booking/FindClasses.tsx` - Main implementation with new interfaces, functions, and UI enhancements
- `src/pages/booking/FindClasses.tsx:24-29` - Added LocationClassInfo interface
- `src/pages/booking/FindClasses.tsx:70-148` - Added getLocationClassInfo function
- `src/pages/booking/FindClasses.tsx:252-295` - Added formatAgeRange and formatDateRange helper functions
- `src/pages/booking/FindClasses.tsx:427-481` - Enhanced location cards with class information section

### Business Value
- **High**: Provides essential information for booking decisions
- **UX Improvement**: Reduces uncertainty and improves conversion rates
- **Information Architecture**: Better organization of class data for customer decision-making
- **Trust Building**: Transparent information display builds confidence in the booking process

### Technical Quality
- **Type Safety**: Full TypeScript interfaces for data structures
- **Error Handling**: Graceful handling of missing or invalid class data
- **Performance**: Efficient data aggregation and caching-friendly queries
- **Scalability**: Handles varying numbers of classes and schedules per location
- **Accessibility**: Color-coded icons with semantic meaning

</details>

---

## 🏗️ Implementation Notes

### Development Process
1. **Feature Requests**: New features should be added using the template below
2. **Complexity Assessment**: 
   - 🟢 Low: 1-2 hours of development
   - 🟡 Medium: 3-8 hours of development  
   - 🟠 High: 1-2 days of development
   - 🔴 Epic: Multiple days or iterations
3. **Priority Levels**:
   - 🟢 Low: Nice to have, no urgency
   - 🟡 Medium: Improves workflow, moderate business value
   - 🟠 High: Important for user experience
   - 🔴 Critical: Blocking or major business impact

### Feature Template
```markdown
## Feature #X: [Title]
- **Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
- **Complexity:** 🔴 Epic | 🟠 High | 🟡 Medium | 🟢 Low  
- **Description:** [What the feature does]
- **Business Value:** [Why this feature is needed]
- **Technical Requirements:** [Implementation details]
- **Acceptance Criteria:** [Testable requirements]
```

### Workflow
1. **New Feature**: Add to "Planned Features" table
2. **In Development**: Move to in-progress status
3. **Completed**: Move to "Completed Features" with commit hash
4. **Testing**: Verify acceptance criteria are met
5. **Documentation**: Update relevant docs if needed

<details>
<summary><strong>Feature #12:</strong> Add bulk actions to locations and classes tables</summary>

### Description
Extend bulk action functionality from leads table to locations and classes tables, providing consistent bulk operation capabilities across all portal tables.

### Current State
- Bulk actions are only available on leads table
- Locations and classes tables only have individual row actions
- No consistent bulk operation experience across portal

### Proposed Enhancement
Add bulk action capabilities to:
1. **Locations Table** - Archive/unarchive, delete, activate/deactivate multiple locations
2. **Classes Table** - Archive/unarchive, delete, activate/deactivate multiple classes
3. **Consistent UI** - Same bulk action interface as leads table

### Technical Requirements
- Extend existing bulk action pattern to locations and classes tables
- Add bulk operation hooks for location and class management
- Ensure proper validation and confirmation dialogs
- Maintain selection state during table operations

### Implementation Details
- Add selection state management to LocationsTable and ClassesTable
- Create bulk action dropdowns in page headers
- Implement bulk operations for common actions (archive, delete, status changes)
- Add confirmation dialogs for destructive operations

### Acceptance Criteria
- [ ] Locations table has bulk selection and actions
- [ ] Classes table has bulk selection and actions
- [ ] Bulk operations work consistently across all tables
- [ ] Proper confirmation dialogs for destructive actions
- [ ] Selection state persists during operations

### Priority: 🟢 Low
- **Business Value**: Medium - improves workflow efficiency
- **Development Effort**: Medium - extending existing patterns
- **Target Version**: v0.9.8

</details>

<details>
<summary><strong>Feature #13:</strong> Enhanced find-classes page with comprehensive class information</summary>

### Description
Add comprehensive class information display to the find-classes page including date ranges, age ranges, class counts, and schedule previews to help parents make informed booking decisions.

### Current State
- Find-classes page shows basic location information
- No class-specific details visible before booking
- Parents lack essential information for decision-making
- Limited transparency about available programs

### Proposed Enhancement
Add comprehensive class information display:

**1. Age Range Information**
- Display min-max age ranges for classes at each location
- Smart formatting ("3-7 years", "All ages", "5+ years")
- Clear age requirement communication

**2. Date Range Display**
- Show class availability periods
- Handle ongoing, start-only, and end-only date ranges
- Clear scheduling transparency

**3. Class Count and Variety**
- Display total number of available classes
- Show class variety and options
- Help parents understand program depth

**4. Schedule Previews**
- Sample class schedules with time slots
- Visual schedule badges with overflow indicators
- Quick schedule overview without drilling down

### Technical Requirements
- Enhanced location data queries to include class information
- Age range calculation and formatting functions
- Date range processing and display logic
- Schedule aggregation and preview generation
- Responsive design for class information cards

### Implementation Details
- Create LocationClassInfo interface for structured data
- Add getLocationClassInfo function for data aggregation
- Implement formatAgeRange and formatDateRange helpers
- Enhance location cards with class information sections
- Add colored icons and badges for visual hierarchy

### Acceptance Criteria
- [ ] Age ranges displayed clearly for each location
- [ ] Date ranges show class availability periods
- [ ] Class counts provide program variety indication
- [ ] Schedule previews offer quick timing overview
- [ ] Information enhances booking decision-making
- [ ] Responsive design works across devices
- [ ] Performance maintained with complex data queries

### Priority: 🟡 Medium
- **Business Value**: High - improves booking conversion rates
- **UX Impact**: High - reduces uncertainty in booking process
- **Development Effort**: Medium - data aggregation and UI enhancements
- **Target Version**: v0.9.9

### Business Impact
- **Conversion Improvement**: Better information leads to more confident bookings
- **Customer Experience**: Reduces pre-booking questions and uncertainty
- **Competitive Advantage**: Transparent information builds trust
- **Support Reduction**: Self-service information reduces support inquiries

</details>

<details>
<summary><strong>Feature #14:</strong> Admin section data population and functionality</summary>

### Description
Resolve critical issue where Admin section pages show no information despite being implemented, ensuring all admin functionality works as designed.

### Priority: 🔴 Critical
### Status: `ACTIVE ISSUE` - Priority critical

### Current State
- Admin section pages exist but show no data
- Dashboard, User Management, Transactions pages appear empty
- Admin functionality is non-functional despite implementation
- Critical blocker for admin workflow

### Issue Analysis
This appears to be a data loading or permissions issue where:
- Admin pages are implemented but not receiving data
- Could be authentication/authorization problems
- May be related to database queries or RLS policies
- Potential React Query cache or hook issues

### Expected Behavior
Admin section should display:
1. **Dashboard** - Real metrics and analytics data
2. **User Management** - List of all franchisees with management options
3. **Transactions** - Transaction data with filtering and management
4. **Global Settings** - System-wide configuration options

### Technical Investigation Required
- Verify admin user permissions and role assignments
- Check database RLS policies for admin access
- Investigate React Query hooks for admin data fetching
- Test admin authentication and session management
- Review console errors and network requests

### Critical Business Impact
- **Admin Workflow Blocked**: Cannot manage users or view system data
- **Support Limitations**: Cannot assist users effectively
- **Business Operations**: Platform administration is non-functional
- **Revenue Impact**: Cannot process refunds or manage transactions

### Resolution Priority
This should be addressed immediately as it blocks core admin functionality.

### Acceptance Criteria
- [ ] Admin dashboard shows real metrics and data
- [ ] User Management displays all franchisees
- [ ] Transactions page loads and functions properly
- [ ] All admin CRUD operations work correctly
- [ ] Admin authentication and permissions work properly

### Target Resolution
- **Urgency**: Immediate - blocks admin workflow
- **Complexity**: 🟠 High - requires debugging and investigation
- **Dependencies**: May require database, auth, or infrastructure fixes

</details>

<details>
<summary><strong>Feature #16:</strong> Location Details mini-map integration</summary>

### Description
Integrate a mini-map component into the Location Details page to provide visual location context and quick access to external mapping services.

### Status: ✅ COMPLETED (2025-07-13)

### Implementation Summary
Successfully implemented mini-map functionality within the Location Details page:
1. **LocationMap Component** - Interactive mini-map placeholder with external map integration
2. **Multiple Map Services** - Quick access to Google Maps and Apple Maps
3. **Directions Integration** - One-click directions using location coordinates or address
4. **Coordinate Display** - Visual display of latitude/longitude when available
5. **Responsive Design** - Proper layout for different screen sizes

### Technical Implementation
- **External Map Links** - Generates proper URLs for Google Maps and Apple Maps
- **Coordinate Precision** - Uses exact coordinates when available, falls back to address
- **User Experience** - Clear calls-to-action for viewing in external applications
- **Error Handling** - Graceful handling of missing coordinate data
- **Future-Ready** - Placeholder design ready for full interactive map integration

### Key Features Added
1. **Map Placeholder**: Visual representation with clear next steps
2. **External Map Buttons**: Direct links to Google Maps and Apple Maps
3. **Get Directions**: One-click directions functionality
4. **Coordinate Display**: Technical details for precise location data
5. **Address Fallback**: Works with or without coordinate data

### Files Created
- `src/components/locations/LocationMap.tsx` - Mini-map component with external integrations

### Business Value
- **Medium**: Improves location visualization and accessibility
- **User Experience**: Quick access to mapping and directions
- **Workflow Enhancement**: Reduces friction for location-based tasks

</details>

<details>
<summary><strong>Feature #17:</strong> Location-specific class management interface</summary>

### Description
Provide a dedicated interface within Location Details page for viewing and managing classes specific to that location, streamlining class administration workflow.

### Status: ✅ COMPLETED (2025-07-13)

### Implementation Summary
Successfully implemented location-specific class management:
1. **LocationClasses Component** - Comprehensive class listing for specific location
2. **Class Overview Table** - Detailed view of all classes with key metrics
3. **Quick Actions** - Direct access to add/edit classes from location context
4. **Empty State Handling** - User-friendly interface when no classes exist
5. **Data Integration** - Real-time class and schedule information

### Technical Implementation
- **Database Queries** - Efficient fetching of location-specific class data
- **Schedule Counting** - Aggregated schedule information per class
- **Navigation Integration** - Seamless routing to class management pages
- **Performance Optimization** - Minimized queries with proper data structuring
- **Error Handling** - Graceful handling of data loading failures

### Key Features Added
1. **Class Table View**: Comprehensive listing with age range, duration, capacity
2. **Schedule Information**: Visual indication of class scheduling completeness
3. **Status Indicators**: Clear active/inactive badges for each class
4. **Quick Navigation**: Direct edit links and add class functionality
5. **Empty State Design**: Encouraging interface for adding first classes

### Data Displayed
- **Class Name & Description**: Primary class information
- **Age Range**: Formatted age requirements (e.g., "3-7 years", "All ages")
- **Duration**: Class length in minutes
- **Capacity**: Maximum number of children per class
- **Schedule Count**: Number of scheduled sessions
- **Status**: Active/inactive with visual indicators

### Files Created
- `src/components/locations/LocationClasses.tsx` - Location-specific class management interface

### Business Value
- **High**: Streamlines class management workflow from location context
- **Efficiency**: Reduces navigation between location and class management
- **Data Visibility**: Immediate overview of class offerings per location
- **Workflow Optimization**: Contextual access to class creation and editing

</details>