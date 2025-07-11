# 🐞 Bug Tracker

> **Last Updated:** 10 Jul 2025  
> **Active Issues:** 8 | **Resolved:** 22

---

## 🔴 Open Issues

| ID | Title | Severity | Priority | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------|----------------|---------|
| #31 | Map location positioning incorrect for Lilley Gulch | 🟡 Medium | P2 | unassigned | Map components, geocoding | 2025-07-10 |
| #32 | Login screen needs specific error feedback for invalid credentials | 🟢 Low | P2 | unassigned | Login components | 2025-07-10 |
| #33 | Dark Mode button in portal doesn't function | 🟢 Low | P3 | unassigned | Portal theme components | 2025-07-10 |
| #34 | Portal tables have excessive white space and pagination issues | 🟡 Medium | P2 | unassigned | Portal table components | 2025-07-10 |
| #35 | Admin section menus are transparent | 🟡 Medium | P2 | tracked separately | Admin layout, menu components | 2025-07-10 |
| #36 | Email confirmation loads broken page | 🟠 High | P1 | unassigned | Auth confirmation flow | 2025-07-10 |
| #37 | Admin user management dropdowns have yellow outline | 🟢 Low | P3 | tracked separately | Admin dropdown styling | 2025-07-10 |
| #38 | Admin user impersonation shows incorrect data context | 🟠 High | P2 | tracked separately | Admin impersonation, portal hooks | 2025-07-10 |

---

## ✅ Resolved Issues

| ID | Title | Resolution | Commit | Resolved |
|----|-------|------------|---------|----------|
| #12 | URGENT: Booking flow broken due to CardHeader undefined error | Fixed shadcn/ui to Mantine migration issues in ClassBooking.tsx | `e7de569` | 2025-06-28 |
| #18 | Language requirement section needs blue "how it works" section | Added blue informational card with clear explanations | `existing` | 2025-06-30 |
| #19 | Duplicate asterisk in Parent/Guardian Information booking page | Removed manual asterisks, rely on Mantine's required attribute | `1a2cc15` | 2025-06-30 |
| #20 | Booking page needs Soccer Stars styling | Applied Soccer Stars branding with navy header and red accents | `587abce` | 2025-06-29 |
| #21 | Booking confirmation page needs Soccer Stars styling | Applied Soccer Stars branding consistently | `587abce` | 2025-06-29 |
| #22 | Missing liability waiver link in agreements section + rename section | Renamed section to "Booking Agreements", enhanced waiver link visibility | `bdc119b` | 2025-06-30 |
| #23 | Agreement checkboxes/icons misaligned (poor design) | Fixed alignment with proper flex layout and spacing | `d7fe61f` | 2025-06-29 |
| #28 | Class names duplicated in Name column on classes page | Show secondary name only if different from primary name | `1a2cc15` | 2025-06-30 |
| #30 | Parent/Guardian form red asterisk on newline instead of inline | Fixed inline asterisk positioning with styled spans | `1a2cc15` | 2025-06-30 |
| #17 | Three broken images on fill-the-field.com home page | Updated image paths to correct /media/ locations | `current` | 2025-06-29 |
| #13 | Find-classes page using portal styling instead of Soccer Stars branding | Applied Soccer Stars branding with navy header and branded elements | `current` | 2025-06-30 |
| #27 | Settings page "How it works" boxes have inconsistent styling | Standardized to Mantine Card format with consistent blue styling | `current` | 2025-06-30 |
| #29 | Asterisk color inconsistency across required fields | Standardized all required field asterisks to red color | `current` | 2025-06-30 |
| #24 | Select Class Date modal needs visual date selection indicator | Added CheckCircle icons and auto-selection for single dates | `current` | 2025-06-30 |
| #25 | Share with Friends message contains extra information | Cleaned up sharing to use only template content without extra URLs | `current` | 2025-06-30 |
| #26 | Confirmation page needs Facebook/Instagram icons instead of text | Added branded Facebook and Instagram icon buttons | `current` | 2025-06-30 |
| #15 | Duplicate asterisks on lead capture form fields | Fixed Mantine form validation patterns | `current` | 2025-06-30 |
| #14 | Waiver editor not editable on first profile creation | Fixed state initialization with useEffect for settings loading | `current` | 2025-06-30 |
| #11 | Bulk table actions limited to Archive only | Enhanced with complete status updates and bulk operations | `current` | 2025-06-30 |
| #16 | Map debug console logs on find-classes page | Added environment-based logging (development only) | `current` | 2025-06-30 |

---

## 📋 Bug Details

**Note:** Bugs #1-10 have been archived to [bugs-archive.md](./bugs-archive.md) for better performance.

<details>
<summary><strong>Bug #11:</strong> Bulk table actions limited to Archive only</summary>

### Title: Bulk table actions limited to Archive only
### Status: `RESOLVED` ✅ 2025-06-30
### Priority: Low - workflow improvement

### Issue
- **Problem:** Bulk table actions only show "Archive" option instead of all available Actions Menu actions
- **Impact:** Limited bulk operation capabilities, inefficient workflow
- **Affects:** All portal tables with bulk actions (Leads, Bookings, etc.)

### Expected Behavior
- Bulk actions should include all options available in individual row Actions Menu
- Users should be able to perform any bulk operation they can do individually

### Implementation Summary
Enhanced bulk operations with permanent header dropdown:
1. **Permanent Bulk Actions Dropdown** - Added to page header controls on right side as requested
2. **Complete Status Updates** - All 8 lead statuses (New, Booked Upcoming, Follow-up, etc.)
3. **Archive/Unarchive Actions** - Context-aware based on current view (archived vs active)
4. **Bulk Delete** - With confirmation dialog for safety
5. **Selection Persistence** - Maintains selections during scroll operations
6. **Immediate UI Feedback** - Shows selection count in button, clears immediately on action

**Files Modified:**
- `src/pages/portal/Leads.tsx` - Added permanent bulk actions dropdown to header
- `src/components/leads/LeadsTable.tsx` - Updated to share selection state with parent

**Ready for Testing:** Permanent bulk actions dropdown positioned in header provides all functionality with better UX than popup bar. Selection state persists during scroll and provides immediate feedback.
</details>

<details>
<summary><strong>Bug #38:</strong> Admin user impersonation shows incorrect data context</summary>

### Title: Admin user impersonation shows incorrect data context
### Status: `OPEN` 🔴 2025-07-08
### Priority: High - Admin functionality broken
### Severity: 🟠 High

### Issue
- **Problem:** When admin users impersonate other franchisees, portal shows admin's data instead of impersonated user's data
- **Impact:** Admin cannot effectively support users or debug their specific issues
- **Affects:** Admin impersonation system, all portal components (locations, leads, bookings, profile)

### Reproduction Steps
1. Login as admin user (justinstephenprice@gmail.com or southdenver@soccerstars.com)
2. Navigate to Admin → User Management
3. Click "Impersonate User" on any franchisee
4. Navigate to impersonated user's portal (locations, profile, etc.)
5. **Expected:** See impersonated user's specific data
6. **Actual:** Still shows admin user's data (southdenver@soccerstars.com locations/profile)

### Technical Analysis
- Impersonation session storage works correctly
- ImpersonationBanner shows correct target user
- Exit impersonation navigation works
- **Root Issue:** Some data hooks still bypass impersonation context despite multiple fix attempts

### Files Affected
- `src/hooks/useImpersonation.ts` - Session management
- `src/utils/impersonationHelpers.ts` - Context helpers  
- `src/hooks/useFranchiseeProfile.ts` - User profile data
- `src/pages/portal/Locations.tsx` - Location data
- `src/pages/portal/Profile.tsx` - Profile management
- Portal data hooks that may still use direct auth queries

### Attempted Fixes
1. ✅ Added impersonation session management
2. ✅ Created getEffectiveUserId() helper function
3. ✅ Updated core hooks (useFranchiseeProfile, useFranchiseeData)
4. ✅ Updated portal components (Locations.tsx, Profile.tsx)
5. ❌ Data context still not switching correctly

### Next Steps for Resolution
- Deep audit of all data hooks for direct auth.uid() usage
- Investigate query caching issues that might preserve admin context
- Consider alternative impersonation implementation approach
- Test with React Query devtools to verify query key changes

### Business Impact
- Admin cannot effectively support users
- User debugging and issue resolution severely limited
- Admin productivity reduced for customer service tasks

</details>

<details>
<summary><strong>Bug #12:</strong> URGENT: Booking flow broken due to CardHeader undefined error</summary>

### Title: URGENT: Booking flow broken due to CardHeader undefined error
### Status: `RESOLVED` ✅ 2025-06-28
### Priority: P0 Critical - Revenue blocking
### Severity: 🔴 Critical

### Issue
- **Problem:** JavaScript error "CardHeader is not defined" prevents users from clicking locations to proceed with booking
- **Impact:** COMPLETE BOOKING FLOW BROKEN - Users cannot book classes, resulting in revenue loss
- **Affects:** All public-facing booking pages, specifically find-classes location selection

### Error Details
```
ReferenceError: CardHeader is not defined
    at index-BxKVA-Fw.js:3504:15285
    at Array.map (<anonymous>)
    at Yxe (index-BxKVA-Fw.js:3504:14771)
```

### Root Cause Analysis
- Caused by recent Mantine migration where CardHeader component was not properly imported/converted
- Error occurs during location card rendering in find-classes flow
- Missing import or incorrect component name after shadcn/ui → Mantine migration

### Resolution Implemented
Fixed CardHeader import/reference issues in ClassBooking.tsx component migration to Mantine components.

### Priority Justification
- **P0 Critical**: This was a public-facing revenue-blocking bug
- **Immediate Risk**: Loss of all new bookings until fixed
- **Customer Impact**: Users could not complete the core business function
</details>

<details>
<summary><strong>Bug #33:</strong> Dark Mode button in portal doesn't function</summary>

### Title: Dark Mode button in portal doesn't function
### Status: `OPEN` 🔴 2025-07-08
### Priority: Low - UX enhancement
### Severity: 🟢 Low

### Issue
- **Problem:** Dark Mode toggle button in /portal/ section doesn't respond when clicked
- **Impact:** Users cannot switch to dark theme as expected
- **Affects:** Portal theme system, user preference settings

### Expected Behavior
- Dark Mode button should toggle between light and dark themes
- Theme preference should persist across sessions

### Files Likely Affected
- Portal layout components with theme toggle
- Theme provider/context
- Local storage theme persistence

</details>

<details>
<summary><strong>Bug #34:</strong> Portal tables have excessive white space and pagination issues</summary>

### Title: Portal tables have excessive white space and pagination issues
### Status: `OPEN` 🔴 2025-07-08
### Priority: Medium - UX workflow improvement
### Severity: 🟡 Medium

### Issue
- **Problem:** Large gap of wasted white space after last entry in portal tables
- **Impact:** Poor user experience, inefficient use of screen space
- **Affects:** All portal table views (leads, bookings, locations, classes)

### Expected Behavior
1. Add more entries per table view
2. Add selector to choose number of items displayed
3. Make page selector "float" at bottom of window for quick navigation
4. Eliminate excessive white space below table content

### Technical Requirements
- Implement configurable rows per page (10, 25, 50, 100)
- Add sticky pagination controls at viewport bottom
- Optimize table height to minimize white space
- Maintain scroll performance with large datasets

### Files Likely Affected
- Portal table components (LeadsTable, BookingsTable, etc.)
- Table pagination controls
- Table layout and styling

</details>

<details>
<summary><strong>Bug #35:</strong> Admin section menus are transparent</summary>

### Title: Admin section menus are transparent
### Status: `OPEN` 🔴 2025-07-08
### Priority: Medium - UI consistency
### Severity: 🟡 Medium

### Issue
- **Problem:** Menu elements in /Admin section appear transparent/faded
- **Impact:** Poor visibility and inconsistent UI experience
- **Affects:** Admin section navigation and dropdown menus

### Expected Behavior
- Admin menus should use same styling as portal menus
- Consistent opacity and visual treatment across admin interface

### Technical Solution
- Apply portal menu styling to admin components
- Ensure proper z-index and background properties
- Match Mantine theme configuration between sections

### Files Likely Affected
- `src/layout/AdminLayout.tsx`
- Admin navigation components
- Admin dropdown/menu components
- Theme configuration for admin section

</details>

<details>
<summary><strong>Bug #36:</strong> Email confirmation loads broken page</summary>

### Title: Email confirmation loads broken page
### Status: `OPEN` 🔴 2025-07-08
### Priority: High - Critical user flow
### Severity: 🟠 High

### Issue
- **Problem:** Clicking email confirmation link loads a broken/error page
- **Impact:** New users cannot complete account registration
- **Affects:** User registration and email verification flow

### Expected Behavior
- Email confirmation should redirect to successful confirmation page
- User should be automatically logged in or directed to login
- Clear success message and next steps should be displayed

### Technical Investigation Needed
- Check Supabase auth configuration for email templates
- Verify redirect URLs in email confirmation settings
- Test confirmation flow end-to-end
- Ensure proper error handling for invalid/expired tokens

### Files Likely Affected
- Email confirmation route/page
- Supabase auth configuration
- Email template settings
- Auth callback handling

</details>

<details>
<summary><strong>Bug #37:</strong> Admin user management dropdowns have yellow outline</summary>

### Title: Admin user management dropdowns have yellow outline
### Status: `OPEN` 🔴 2025-07-08
### Priority: Low - Visual styling
### Severity: 🟢 Low

### Issue
- **Problem:** Weird yellow outline appears on dropdowns in Admin/User Management
- **Impact:** Inconsistent visual styling, unprofessional appearance
- **Affects:** Admin user management interface dropdowns

### Reference
- Screenshot: `docs/screenshots/Screenshot 2025-07-08 at 2.47.59 PM.png`

### Expected Behavior
- Dropdowns should have consistent styling with rest of admin interface
- No unexpected colored outlines or borders

### Technical Solution
- Review Mantine Select/dropdown component styling
- Check for conflicting CSS rules causing yellow outline
- Ensure proper focus states and hover effects

### Files Likely Affected
- `src/pages/admin/UserManagement.tsx`
- Admin dropdown components
- Mantine theme configuration
- CSS overrides affecting dropdown styling

</details>

---

## 🔧 Quick Actions

- **Add New Bug:** Copy template below
- **Add Feature Request:** Use [features.md](./features.md) instead  
- **Test Fixes:** Run `npm run dev` and test affected areas
- **Deploy:** Push to main branch for testing

### Bug Template
```markdown
## Bug #X: [Title]
- **Severity:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low  
- **Affects:** [Component/Page names]
- **Reproduction:** [Steps]
- **Expected:** [What should happen]
- **Actual:** [What happens instead]
```