# 🚀 Feature Requests & Enhancements

> **Last Updated:** 28 Jun 2025  
> **Active Features:** 6 | **Completed:** 3 | **Backlog:** 1

---

## 🔮 Planned Features

| ID | Title | Priority | Complexity | Assignee | Target Version |
|----|-------|----------|------------|----------|----------------|
| #9 | Profile password management | 🔴 High | 🟡 Medium | unassigned | v0.9.6 |
| #6 | Enhanced notification types & end-of-day summaries | 🟡 Medium | 🔴 High | unassigned | v1.0.0 |
| #2 | "Add Classes" button in Locations table actions | 🟢 Low | 🟢 Low | unassigned | v0.9.3 |
| #3 | Enhanced Booking Restrictions with radio button logic | 🟢 Low | 🟡 Medium | unassigned | v0.9.4 |
| #7 | Collapsible portal/admin sidebars | 🟢 Low | 🟡 Medium | unassigned | v0.9.5 |
| #10 | Remove redundant business info from profile page | 🟢 Low | 🟡 Medium | unassigned | v0.9.5 |

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