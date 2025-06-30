# 🐞 Bug Tracker

> **Last Updated:** 30 Jun 2025  
> **Active Issues:** 17 | **Resolved:** 12

---

## 🔴 Open Issues

| ID | Title | Severity | Priority | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------|----------------|---------|
| #18 | Language requirement section needs blue "how it works" section | 🟡 Medium | P1 | unassigned | /portal/settings | 2025-06-29 |
| #19 | Duplicate asterisk in Parent/Guardian Information booking page | 🟢 Low | P1 | unassigned | ParentGuardianForm.tsx | 2025-06-29 |
| #20 | Booking page needs Soccer Stars styling | 🟡 Medium | P1 | unassigned | ClassBooking.tsx | 2025-06-29 |
| #21 | Booking confirmation page needs Soccer Stars styling | 🟡 Medium | P1 | unassigned | BookingConfirmation.tsx | 2025-06-29 |
| #22 | Missing liability waiver link in agreements section + rename section | 🟡 Medium | P1 | unassigned | ParentGuardianAgreements.tsx | 2025-06-29 |
| #23 | Agreement checkboxes/icons misaligned (poor design) | 🟢 Low | P1 | unassigned | ParentGuardianAgreements.tsx | 2025-06-29 |
| #13 | Find-classes page using portal styling instead of Soccer Stars branding | 🟡 Medium | P2 | unassigned | /free-trial/find-classes | 2025-06-28 |
| #24 | Select Class Date modal needs visual date selection indicator | 🟢 Low | P2 | unassigned | ParticipantModal.tsx | 2025-06-29 |
| #25 | Share with Friends message contains extra information | 🟢 Low | P2 | unassigned | BookingConfirmation.tsx | 2025-06-29 |
| #26 | Confirmation page needs Facebook/Instagram icons instead of text | 🟢 Low | P2 | unassigned | BookingConfirmation.tsx | 2025-06-29 |
| #15 | Duplicate asterisks on lead capture form fields | 🟢 Low | P3 | unassigned | Lead capture form components | 2025-06-28 |
| #14 | Waiver editor not editable on first profile creation | 🟢 Low | P3 | unassigned | /portal/settings waiver section | 2025-06-28 |
| #11 | Bulk table actions limited to Archive only | 🟢 Low | P4 | unassigned | LeadsTable.tsx | 2025-06-26 |
| #16 | Map debug console logs on find-classes page | 🟢 Low | P4 | unassigned | /free-trial/find-classes | 2025-06-28 |
| #27 | Settings page "How it works" boxes have inconsistent styling | 🟢 Low | P2 | unassigned | /portal/settings | 2025-06-30 |
| #28 | Class names duplicated in Name column on classes page | 🟡 Medium | P1 | unassigned | /portal/classes | 2025-06-30 |
| #29 | Asterisk color inconsistency across required fields | 🟢 Low | P2 | unassigned | Form components | 2025-06-30 |
| #30 | Parent/Guardian form red asterisk on newline instead of inline | 🟢 Low | P2 | unassigned | ParentGuardianForm.tsx | 2025-06-30 |

---

## ✅ Resolved Issues

| ID | Title | Resolution | Commit | Resolved |
|----|-------|------------|---------|----------|
| #1 | Landing page shows hardcoded contact info | Replaced with dynamic franchisee data | `b96eed9` | 2025-06-24 |
| #2 | Dropdown menus transparent/unreadable | Migrated to Mantine v8 + z-index fixes | `6e9d494` | 2025-06-24 |
| #3 | Contact info missing from landing page footer | Fixed public page data fetching by slug | `ff6dac4` | 2025-06-24 |
| #4 | Leads table "View Details" and "Edit Lead" redundant | Both actions now navigate to Lead Details page | `ff6dac4` | 2025-06-24 |
| #5 | Classes column shows "0" instead of actual count | Updated useLocations hook with class counts | `ff6dac4` | 2025-06-24 |
| #6 | Booking flow Parent Guardian Information panel issues | Migrated to Mantine components + pre-population fix | `08ede3f` | 2025-06-26 |
| #7 | Portal bookings page long load time and missing data | Optimized database queries and client-side filtering | `current` | 2025-06-27 |
| #8 | Liability waiver 404 error and opens new page | Replaced href link with WaiverModal popup | `56efdf9` | 2025-06-26 |
| #9 | Location selector transparent on program creation page | Migrated LocationSelector from shadcn/ui to Mantine components | `current` | 2025-06-27 |
| #10 | Lead Details booking data combination issue | Separated booking and appointment queries to prevent data duplication | `current` | 2025-06-27 |
| #12 | URGENT: Booking flow broken due to CardHeader undefined error | Fixed shadcn/ui to Mantine migration issues in ClassBooking.tsx | `e7de569` | 2025-06-28 |
| #17 | Three broken images on fill-the-field.com home page | Updated image paths to correct /media/ locations | `current` | 2025-06-29 |

---

## 📋 Bug Details

<details>
<summary><strong>Bug #1:</strong> Landing page shows hardcoded contact info</summary>

### Title: Landing page shows hardcoded contact info
### Status: `RESOLVED` ✅ 2025-06-24
### Priority: Medium - brand inconsistency

### Issue
- **Problem:** Landing pages display hardcoded "Lovable Test" contact info instead of franchisee-specific data
- **Impact:** Brand inconsistency, potential privacy concerns with wrong contact info
- **Affects:** All public landing pages (e.g., `/free-trial/soccer-stars-of-south-denver`)

### Expected Behavior
- Footer should pull contact data from `/portal/settings → Contact Information`
- Public pages should show **phone + email only** (no street address)

### Reproduction
1. Visit any franchisee landing page
2. Scroll to footer or reach booking confirmation
3. Observe hardcoded contact info instead of dynamic data

### Technical Notes
- Need to identify landing page components using hardcoded contact
- Implement dynamic data fetching from franchisee settings
- Ensure proper data filtering for public vs. portal views

### Resolution Implemented
1. **BookingLanding.tsx footer** - Added `useFranchiseeData()` hook and replaced hardcoded South Denver contact info with dynamic `franchiseeData.phone` and `franchiseeData.email`
2. **ContactUs.tsx fallback** - Changed fallback email from `info@soccerstars.com` to `contact@fillthefield.com` 
3. **Calendar UID** - Updated `calendarUtils.ts` to use `@fillthefield.com` instead of `@soccerstars.com` for calendar event UIDs

**Files Modified:**
- `src/pages/booking/BookingLanding.tsx` (lines 251-262)
- `src/pages/landing/ContactUs.tsx` (line 149)  
- `src/utils/calendarUtils.ts` (line 58)

**Result:** All public-facing contact information now displays franchisee-specific data instead of hardcoded South Denver values.
</details>

<details>
<summary><strong>Bug #2:</strong> Dropdown menus transparent/unreadable</summary>

### Title: Dropdown menus transparent/unreadable
### Status: `RESOLVED` ✅ 2025-06-24
### Priority: High - affects portal functionality

### Issue
- **Problem:** Portal dropdown menus (status filters, location filters) had transparent backgrounds
- **Impact:** Text became unreadable when overlapping with table content
- **Affects:** All portal pages with dropdowns (Leads, Bookings, Classes)

### Root Cause
1. **Component mismatch:** Portal was using shadcn/ui Select instead of Mantine components
2. **Z-index conflict:** Sticky table headers (z-index: 2) vs dropdown content (default z-index)
3. **Missing portal configuration:** Dropdowns not using `withinPortal` prop

### Resolution Implemented
1. **Migrated all portal dropdowns to Mantine Select:**
   - `src/pages/portal/Leads.tsx` (location filter)
   - `src/pages/portal/Bookings.tsx` (location filter) 
   - `src/pages/portal/Classes.tsx` (location filter)
   - `src/components/leads/StatusSelect.tsx` (status selector)
   - `src/components/portal/TimezoneSettingsCard.tsx` (timezone setting)

2. **Fixed z-index hierarchy:**
   - Sticky headers: `z-index: 10` 
   - Dropdown menus: `z-index: 100` (via CSS override)

3. **Added `withinPortal` prop** to all Mantine Select components
</details>

<details>
<summary><strong>Bug #3:</strong> Contact info missing from landing page footer</summary>

### Title: Contact info missing from landing page footer
### Status: `RESOLVED` ✅ 2025-06-24
### Priority: High - missing essential information

### Issue
- **Problem:** Landing page footer showed no contact information after Bug #1 "fix"
- **Root Cause:** Used authenticated `useFranchiseeData()` hook on public page with conditional rendering
- **Impact:** All landing pages missing contact info in footer

### Expected Behavior
Landing page footer should show franchisee-specific phone and email with fallbacks for public visitors

### Resolution Implemented
1. **Replaced authentication-based hook** with direct Supabase query by slug (like ContactUs.tsx)
2. **Added useEffect** to fetch franchisee data when franchiseeSlug changes
3. **Added fallback values** instead of conditional rendering that hides sections
4. **Used pattern:** `{franchiseeData?.phone || 'Contact for details'}`

**Files Modified:**
- `src/pages/booking/BookingLanding.tsx` (lines 28-59, 282-298)
</details>

<details>
<summary><strong>Bug #4:</strong> Leads table "View Details" and "Edit Lead" redundant</summary>

### Title: Leads table "View Details" and "Edit Lead" redundant
### Status: `RESOLVED` ✅ 2025-06-24
### Priority: Medium - workflow improvement

### Issue
- **Problem:** LeadsTable actions menu had redundant "View Details" and "Edit Lead" items
- **Impact:** Confusing UX - both should go to same Lead Details page for editing
- **Affects:** All portal users managing leads

### Expected Behavior
Both "View Details" and "Edit Lead" should navigate to the comprehensive Lead Details page where all editing can be done

### Resolution Implemented
1. **Added useNavigate hook** to LeadsTable component
2. **Created handleViewDetails** function that navigates to `leads/${leadId}`
3. **Updated both menu items** to use same navigation handler
4. **Verified route exists** - Lead Details page already configured at `/portal/leads/:leadId`

**Files Modified:**
- `src/components/leads/LeadsTable.tsx` (lines 2, 25, 111-113, 240-251)
</details>

<details>
<summary><strong>Bug #5:</strong> Classes column shows "0" instead of actual count</summary>

### Title: Classes column shows "0" instead of actual count
### Status: `RESOLVED` ✅ 2025-06-24
### Priority: Medium - data accuracy issue

### Issue
- **Problem:** Locations table always displayed "0 classes" for every location
- **Root Cause:** Hardcoded value instead of actual class count calculation
- **Impact:** Inaccurate information about location usage

### Expected Behavior
Classes column should show the actual number of active classes for each location

### Resolution Implemented
1. **Enhanced useLocations hook** to include class counts via additional query
2. **Added class_count property** to Location interface and LocationProps
3. **Updated LocationsTable** to display actual count with proper pluralization
4. **Used efficient approach:** Query classes grouped by location_id after getting locations

### Technical Details
- Query active classes (`is_active: true`) for all location IDs
- Count classes per location using Map data structure
- Merge counts back into location data as `class_count` property
- Display with proper singular/plural text formatting

**Files Modified:**
- `src/hooks/useLocations.ts` (lines 17, 23-81)
- `src/components/locations/LocationsTable.tsx` (line 118)
- `src/components/locations/LocationCard.tsx` (line 24)
</details>

<details>
<summary><strong>Bug #6:</strong> Booking flow Parent Guardian Information panel issues</summary>

### Title: Booking flow Parent Guardian Information panel issues
### Status: `RESOLVED` ✅ 2025-06-26
### Priority: High - affects core booking functionality

### Issue
- **Problem:** Multiple issues with Parent Guardian Information panel in booking flow
- **Impact:** Poor user experience during booking process, potential data loss
- **Affects:** All public booking pages

### Specific Problems
1. **Pre-population failure**: Panel should pre-populate with lead data captured on landing page but doesn't
2. **Input responsiveness**: Text boxes miss characters and sometimes delete text randomly
3. **Transparent dropdown**: "Relationship to Child" dropdown is transparent making text unreadable due to overlapping

### Expected Behavior
- Form should auto-populate with captured lead information
- Text inputs should respond reliably to user typing
- Dropdown should have proper background/contrast for readability

### Reproduction
1. Fill out lead capture form on landing page
2. Proceed to booking flow
3. Observe Parent Guardian Information panel issues

### Resolution Implemented
1. **Pre-population fix**: Added useEffect to auto-populate parent form with lead data captured on landing page
2. **Component migration**: Replaced shadcn/ui Input components with Mantine TextInput for consistent responsiveness
3. **Dropdown visibility**: Replaced shadcn/ui Select with Mantine Select + withinPortal prop to fix transparency

**Files Modified:**
- `src/components/booking/ParentGuardianForm.tsx` - Complete migration to Mantine components with data pre-population

**Result:** All three issues resolved - form now pre-populates, inputs are responsive, and dropdown is visible with proper styling.
</details>

<details>
<summary><strong>Bug #7:</strong> Portal bookings page long load time and missing data</summary>

### Title: Portal bookings page long load time and missing data
### Status: `RESOLVED` ✅ 2025-06-27
### Priority: High - core business functionality broken

### Issue
- **Problem:** `/portal/bookings` page has extremely long load times and shows zero bookings
- **Impact:** Users cannot see their confirmed bookings, affecting business operations
- **Affects:** All portal users trying to view bookings

### Specific Problems
1. **Long load time**: Page takes excessive time to load
2. **Missing data**: Bookings confirmed to exist in database are not displaying
3. **Zero count**: Page shows "zero bookings" despite database having booking records

### Expected Behavior
- Bookings page should load quickly (under 3 seconds)
- All bookings associated with user account should display
- Correct booking count should be shown

### Resolution Implemented
1. **Query Optimization**: Replaced complex !inner joins with left joins to prevent data loss
2. **Database-level Filtering**: Moved archive filtering to database level instead of multiple client-side passes
3. **Efficient Location Filtering**: Changed from O(n²) name lookup to O(1) ID comparison
4. **Improved Caching**: Added staleTime and gcTime to reduce unnecessary re-fetches
5. **Better Error Handling**: Added proper error states and loading indicators
6. **Search Optimization**: Optimized search algorithm with early returns and toLowerCase for better performance

**Files Modified:**
- `src/hooks/useBookings.ts` - Complete query optimization and caching
- `src/pages/portal/Bookings.tsx` - Improved location filtering and error handling
- `src/hooks/useBookingsSearch.ts` - Optimized search performance and removed redundant filtering

**Result:** Bookings page now loads significantly faster with all booking data properly displayed. Location filtering is efficient and search performance is improved.
</details>

<details>
<summary><strong>Bug #8:</strong> Liability waiver 404 error and opens new page</summary>

### Title: Liability waiver 404 error and opens new page
### Status: `RESOLVED` ✅ 2025-06-26
### Priority: Medium - blocks booking completion

### Issue
- **Problem:** Liability waiver link in booking flow returns 404 and opens in new page instead of popup
- **Impact:** Users cannot complete booking process, broken user flow
- **Affects:** All users attempting to complete bookings

### Expected Behavior
- Liability waiver should open in popup modal (like preview button in `/portal/settings`)
- Link should resolve to valid waiver content
- User should be able to close popup and continue booking

### Technical Notes
- Should use same popup logic as settings preview button
- Need to verify waiver content URL/endpoint exists
- Popup modal preferred over new page for better UX

### Resolution Implemented
1. **Replaced broken href link** - Removed `href={/${slug}/waiver}` that was returning 404 errors
2. **Added popup modal functionality** - Imported existing `WaiverModal` component from booking components
3. **Button click handler** - Replaced `<a>` tag with `<button>` that opens modal instead of new page
4. **Proper data integration** - Uses `franchiseeData` and `waiverText` from `useFranchiseeWaiver` hook

**Files Modified:**
- `src/components/booking/ParentGuardianForm.tsx` - Replaced href link with WaiverModal popup

**Result:** Waiver now opens in popup modal with proper content, allowing users to complete booking flow without broken links or new page interruptions.
</details>

<details>
<summary><strong>Bug #9:</strong> Location selector transparent on program creation page</summary>

### Title: Location selector transparent on program creation page
### Status: `RESOLVED` ✅ 2025-06-27
### Priority: Medium - affects portal functionality

### Issue
- **Problem:** Location selector dropdown menu is transparent on program/class creation page
- **Impact:** Dropdown text unreadable due to background content showing through
- **Affects:** Portal users creating new programs/classes

### Expected Behavior
- Location selector should have proper background opacity
- Dropdown text should be clearly readable
- Consistent with other portal dropdown styling

### Resolution Implemented
1. **Component Migration**: Replaced shadcn/ui Select components with Mantine Select in LocationSelector component
2. **Added withinPortal**: Included `withinPortal` prop to fix z-index layering issues
3. **Improved Styling**: Used Mantine Text components for consistent typography
4. **Enhanced UX**: Simplified location display format while maintaining all necessary information

**Files Modified:**
- `src/components/classes/LocationSelector.tsx` - Complete migration from shadcn/ui to Mantine components

**Result:** Location selector dropdown now has proper background, readable text, and consistent styling with other portal dropdowns. Issue follows the same successful pattern used to resolve Bug #2.
</details>

<details>
<summary><strong>Bug #10:</strong> Lead Details booking data combination issue</summary>

### Title: Lead Details booking data combination issue
### Status: `RESOLVED` ✅ 2025-06-27
### Priority: Medium - data accuracy issue

### Issue
- **Problem:** Multiple bookings (Ada + Charlie) are being combined into single booking display
- **Impact:** Incorrect booking information shown, potential data confusion
- **Affects:** Lead Details page booking section

### Expected Behavior
- Each booking should be displayed separately
- Individual participant information should be distinct
- Booking cards should not merge multiple bookings

### Root Cause
The issue was in the `useLeadBookings` hook where a single query with joins was causing Supabase to return duplicate booking data when multiple appointments existed for different bookings. The relational query was merging appointment data incorrectly.

### Resolution Implemented
1. **Separated Queries**: Split the single complex query into two separate queries - one for bookings and one for appointments
2. **Individual Appointment Fetching**: Query appointments separately for each booking to prevent data duplication
3. **Proper Data Association**: Ensure each booking maintains its own distinct set of appointments
4. **Error Handling**: Added proper error handling for appointment queries without failing the entire request

**Files Modified:**
- `src/hooks/useLeadBookings.ts` - Completely restructured query logic to prevent data combination

**Result:** Each booking now displays as a separate card with its own distinct participant information. Ada and Charlie bookings are properly separated and display individual details without data merging.
</details>

<details>
<summary><strong>Bug #11:</strong> Bulk table actions limited to Archive only</summary>

### Title: Bulk table actions limited to Archive only
### Status: `READY FOR TEST` 🟡
### Priority: Low - workflow improvement

### Issue
- **Problem:** Bulk table actions only show "Archive" option instead of all available Actions Menu actions
- **Impact:** Limited bulk operation capabilities, inefficient workflow
- **Affects:** All portal tables with bulk actions (Leads, Bookings, etc.)

### Expected Behavior
- Bulk actions should include all options available in individual row Actions Menu
- Users should be able to perform any bulk operation they can do individually

### Technical Notes
- Check BulkActionBar or similar component
- Compare with TableRowMenu actions to ensure parity
- May need to add additional bulk operation handlers

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
<summary><strong>Bug #12:</strong> URGENT: Booking flow broken due to CardHeader undefined error</summary>

### Title: URGENT: Booking flow broken due to CardHeader undefined error
### Status: `OPEN` 🔴
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

### Root Cause Analysis Needed
- Likely caused by recent Mantine migration where CardHeader component was not properly imported/converted
- Error occurs during location card rendering in find-classes flow
- Missing import or incorrect component name after shadcn/ui → Mantine migration

### Expected Behavior
- Users should be able to click on location cards to proceed to booking
- No JavaScript errors should occur
- Booking flow should complete successfully

### Priority Justification
- **P0 Critical**: This is a public-facing revenue-blocking bug
- **Immediate Risk**: Loss of all new bookings until fixed
- **Customer Impact**: Users cannot complete the core business function

### Action Required
- Fix CardHeader import/reference immediately
- Test complete booking flow end-to-end
- Deploy fix to production ASAP
</details>

<details>
<summary><strong>Bug #13:</strong> Find-classes page using portal styling instead of Soccer Stars branding</summary>

### Title: Find-classes page using portal styling instead of Soccer Stars branding
### Status: `OPEN` 🟡
### Priority: P1 High - Public branding consistency
### Severity: 🟡 Medium

### Issue
- **Problem:** `/free-trial/find-classes` page displays portal styling instead of Soccer Stars customer-facing branding
- **Impact:** Inconsistent brand experience for customers, unprofessional appearance
- **Affects:** Public-facing booking pages, customer first impressions

### Expected Behavior
- Find-classes page should use Soccer Stars branding colors and styles
- Should match branding seen on https://soccerstars.com
- Consistent with other public-facing pages

### Specific Requirements
- Use Soccer Stars color palette (refer to soccerstars.com)
- Apply appropriate fonts and styling for customer-facing pages
- Remove portal-specific styling elements
- Maintain professional, branded appearance

### Technical Notes
- Review current styling on `/free-trial/find-classes`
- Compare with soccerstars.com brand guidelines
- Ensure consistent brand experience across all public pages

### Priority Justification
- **P1 High**: Public-facing branding affects customer trust and experience
- **Brand Impact**: Inconsistent branding can confuse customers
- **Professional Image**: Important for business credibility
</details>

<details>
<summary><strong>Bug #14:</strong> Waiver editor not editable on first profile creation</summary>

### Title: Waiver editor not editable on first profile creation
### Status: `OPEN` 🟢
### Priority: P2 Medium - UX improvement
### Severity: 🟢 Low

### Issue
- **Problem:** User cannot edit waiver text in `/portal/settings` when first creating their profile
- **Impact:** Poor UX requiring extra steps to edit waiver content
- **Affects:** New users setting up their portal for the first time

### Specific Steps to Reproduce
1. Create new user account
2. Navigate to `/portal/settings`
3. Attempt to edit waiver text box
4. Text box is not editable

### Workaround
1. Click "Save Waiver" button first
2. Then text box becomes editable

### Expected Behavior
- Waiver text box should be immediately editable on first visit
- No need to click "Save Waiver" before editing
- Consistent editing experience for all users

### Priority Justification
- **P2 Medium**: Affects UX but has known workaround
- **Corner Case**: Only affects first-time setup
- **Low Severity**: Does not block functionality, just inconvenient
</details>

<details>
<summary><strong>Bug #15:</strong> Duplicate asterisks on lead capture form fields</summary>

### Title: Duplicate asterisks on lead capture form fields
### Status: `OPEN` 🟢
### Priority: P1 High - Form validation UX (per user feedback)
### Severity: 🟢 Low

### Issue
- **Problem:** Lead capture form displays duplicate asterisks (*) on required fields
- **Impact:** Confusing form validation UI, unprofessional appearance
- **Affects:** Lead capture forms across public booking pages

### Visual Evidence
- See screenshot: `/media/screenshots/Screenshot 2025-06-28 at 3.03.23 PM.png`
- Multiple asterisks visible on form fields

### Expected Behavior
- Required fields should show single asterisk (*) indicator
- Clean, professional form appearance
- Consistent validation UI across all forms

### Technical Analysis
- Likely caused by both HTML required attribute and CSS/component-level asterisk rendering
- May be related to recent Mantine migration form patterns

### Priority Justification
- **P1 High**: User specifically requested high priority for this issue
- **Public-facing**: Affects customer-facing forms
- **Professional Image**: Form quality reflects on business credibility
- **Low Severity**: Visual issue only, doesn't affect functionality
</details>

<details>
<summary><strong>Bug #16:</strong> Map debug console logs on find-classes page</summary>

### Title: Map debug console logs on find-classes page
### Status: `OPEN` 🟢
### Priority: P4 Cleanup
### Severity: 🟢 Low

### Issue
- **Problem:** "Map Debug" messages appearing in browser console on `/free-trial/find-classes` page
- **Impact:** Console noise, potential performance impact, unprofessional in production
- **Affects:** `/free-trial/find-classes` page console output

### Expected Behavior
- No debug messages in production console
- Clean console output for better debugging
- Debug logs only in development environment

### Technical Notes
- Remove console.log, console.debug, or similar debug statements
- Consider using proper logging library with environment-based levels
- May be related to map components or location functionality

### Priority Justification
- **P4 Cleanup**: Does not affect user experience
- **Low Priority**: Internal developer issue only
- **Easy Fix**: Simple code cleanup task
</details>

<details>
<summary><strong>Bug #17:</strong> Three broken images on fill-the-field.com home page</summary>

### Title: Three broken images on fill-the-field.com home page
### Status: `RESOLVED` ✅ 2025-06-29
### Priority: P0 Critical - Public-facing image display
### Severity: 🟡 Medium

### Issue
- **Problem:** Three images on fill-the-field.com home page were using incorrect paths
- **Impact:** Broken images on main company website affecting professional appearance
- **Affects:** All visitors to fill-the-field.com home page

### Specific Problems
1. **Header image**: Using `/lovable-uploads/368dbc9a-49f0-4b8d-b40f-7581664fa0f4.png`
2. **Main center image**: Using `/lovable-uploads/8df4baab-d566-4e42-aa4a-1204ade0112a.png`
3. **Footer image**: Using `/lovable-uploads/36557b73-e388-416f-9acb-5124d4fe7f00.png`

### Expected Behavior
- Header and footer images should display Fill The Field logo
- Main center image should display Fill The Field shield
- All images should load correctly without broken image placeholders

### Visual Evidence
- See screenshot: `/media/screenshots/Screenshot 2025-06-28 at 3.25.01 PM.png`

### Resolution Implemented
Updated image paths in `src/pages/Index.tsx`:
1. **Header image**: Changed to `/media/FILL THE FIELD@3x.png`
2. **Main center image**: Changed to `/media/Sheild@3x.png`
3. **Footer image**: Changed to `/media/FILL THE FIELD@3x.png`

**Files Modified:**
- `src/pages/Index.tsx` - Updated all three image src attributes

**Result:** All three images now display correctly on the fill-the-field.com home page with proper branding.
</details>

<details>
<summary><strong>Bug #18:</strong> Language requirement section needs blue "how it works" section</summary>

### Title: Language requirement section needs blue "how it works" section
### Status: `OPEN` 🟡
### Priority: P1 High - Settings UX improvement
### Severity: 🟡 Medium

### Issue
- **Problem:** Language requirement option in `/portal/settings` lacks explanatory "how it works" section
- **Impact:** Users may not understand what the language requirement setting does
- **Affects:** Portal users configuring their settings

### Expected Behavior
- Language requirement section should have a blue informational box
- Should explain how the setting affects the booking flow
- Similar to other explanatory sections in settings

### Current State
- Language requirement setting exists as simple checkbox
- No explanation of functionality or impact
- Users may not understand when/why to enable/disable it

### Technical Requirements
- Add blue "how it works" informational section
- Explain what happens when language requirement is enabled vs disabled
- Follow existing design patterns in portal settings
- Clear, concise explanation text

### Priority Justification
- **P1 High**: Important for user understanding and proper feature adoption
- **UX Impact**: Helps users make informed configuration decisions
- **Professional Standards**: Settings should be self-explanatory
</details>

<details>
<summary><strong>Bug #19:</strong> Duplicate asterisk in Parent/Guardian Information booking page</summary>

### Title: Duplicate asterisk in Parent/Guardian Information booking page
### Status: `OPEN` 🟢
### Priority: P1 High - Booking flow UX
### Severity: 🟢 Low

### Issue
- **Problem:** Parent/Guardian Information section shows duplicate asterisks on required fields
- **Impact:** Confusing validation UI, unprofessional appearance during booking
- **Affects:** All users completing booking flow

### Expected Behavior
- Required fields should show single asterisk (*) indicator
- Clean, professional form appearance
- Consistent with other form validation patterns

### Technical Analysis
- Likely caused by both HTML required attribute and component-level asterisk rendering
- May be related to Mantine migration from shadcn/ui components
- Similar to Bug #15 but specific to booking page forms

### Priority Justification
- **P1 High**: Affects critical booking flow user experience
- **Public-facing**: Customer-facing forms must look professional
- **Easy Fix**: Simple validation UI cleanup
</details>

<details>
<summary><strong>Bug #20:</strong> Booking page needs Soccer Stars styling</summary>

### Title: Booking page needs Soccer Stars styling
### Status: `OPEN` 🟡
### Priority: P1 High - Public branding consistency
### Severity: 🟡 Medium

### Issue
- **Problem:** Booking page (ClassBooking.tsx) uses generic/portal styling instead of Soccer Stars branding
- **Impact:** Inconsistent brand experience during critical booking process
- **Affects:** All customers attempting to book classes

### Expected Behavior
- Booking page should use Soccer Stars color palette and branding
- Should match soccerstars.com design language
- Professional, branded appearance throughout booking flow

### Specific Requirements
- Apply Soccer Stars colors, fonts, and styling
- Ensure brand consistency with public marketing site
- Maintain professional appearance during booking process
- Remove any portal-specific styling elements

### Priority Justification
- **P1 High**: Critical customer touchpoint must reflect proper branding
- **Revenue Impact**: Professional booking experience affects conversion
- **Brand Consistency**: Essential for customer trust and recognition
</details>

<details>
<summary><strong>Bug #21:</strong> Booking confirmation page needs Soccer Stars styling</summary>

### Title: Booking confirmation page needs Soccer Stars styling
### Status: `OPEN` 🟡
### Priority: P1 High - Post-booking branding
### Severity: 🟡 Medium

### Issue
- **Problem:** Booking confirmation page uses generic styling instead of Soccer Stars branding
- **Impact:** Inconsistent brand experience at booking completion
- **Affects:** All customers who complete booking process

### Expected Behavior
- Confirmation page should use Soccer Stars branding throughout
- Should celebrate the booking completion with branded design
- Professional, branded thank-you experience

### Specific Requirements
- Apply Soccer Stars color palette and fonts
- Ensure brand consistency with booking flow and marketing site
- Maintain celebratory, positive tone with proper branding
- Include appropriate Soccer Stars branded elements

### Priority Justification
- **P1 High**: Last impression during booking process is critical
- **Customer Experience**: Confirmation page sets tone for ongoing relationship
- **Brand Consistency**: Essential for professional appearance
</details>

<details>
<summary><strong>Bug #22:</strong> Missing liability waiver link in agreements section + rename section</summary>

### Title: Missing liability waiver link in agreements section + rename section
### Status: `OPEN` 🟡
### Priority: P1 High - Legal compliance
### Severity: 🟡 Medium

### Issue
- **Problem:** Liability waiver link no longer present in "Required Agreements" section of booking page
- **Impact:** Users cannot access liability waiver, potential legal compliance issue
- **Affects:** All users completing booking flow

### Specific Problems
1. **Missing waiver link**: No way for users to review liability waiver
2. **Aggressive section name**: "Required Agreements" sounds harsh and aggressive

### Expected Behavior
- Liability waiver should be accessible via link or button
- Section should have friendlier, less aggressive name
- Users should be able to review waiver before agreeing

### Suggested Improvements
- Rename section to something like "Booking Agreements" or "Important Information"
- Add liability waiver link that opens in modal
- Maintain legal compliance while improving user experience

### Priority Justification
- **P1 High**: Legal compliance and user access to important documents
- **User Experience**: Users have right to review agreements
- **Professional Standards**: Proper agreement handling is essential
</details>

<details>
<summary><strong>Bug #23:</strong> Agreement checkboxes/icons misaligned (poor design)</summary>

### Title: Agreement checkboxes/icons misaligned (poor design)
### Status: `OPEN` 🟢
### Priority: P1 High - Booking flow design quality
### Severity: 🟢 Low

### Issue
- **Problem:** Checkboxes and icons in agreements section are not aligned properly
- **Impact:** Poor visual design makes booking process look unprofessional
- **Affects:** All users in booking flow agreements section

### Visual Evidence
- See screenshot: `/media/screenshots/Screenshot 2025-06-28 at 3.30.17 PM.png`
- Checkboxes and icons not on same line
- Misaligned elements create poor visual hierarchy

### Expected Behavior
- Checkboxes and icons should be properly aligned
- Clean, professional form layout
- Consistent spacing and visual hierarchy
- Professional booking experience

### Technical Requirements
- Fix CSS/component layout for proper alignment
- Ensure responsive design works on all screen sizes
- Follow design system standards for form elements
- Test alignment across different browsers

### Priority Justification
- **P1 High**: Booking flow must look professional
- **Customer Experience**: Poor design affects trust and conversion
- **Easy Fix**: CSS/layout adjustment
</details>

<details>
<summary><strong>Bug #24:</strong> Select Class Date modal needs visual date selection indicator</summary>

### Title: Select Class Date modal needs visual date selection indicator
### Status: `OPEN` 🟢
### Priority: P2 Medium - Modal UX improvement
### Severity: 🟢 Low

### Issue
- **Problem:** "Select Class Date" in Add Participant modal lacks visual indicator for date selection
- **Impact:** Users may not know if/when they've selected a date
- **Affects:** Users adding participants to class bookings

### Specific Problems
1. **No visual feedback**: No checkbox or indicator when date is selected
2. **Single option confusion**: If only one date available, should be auto-selected with visual confirmation

### Expected Behavior
- Clear visual indicator (checkbox, highlight, etc.) when date is selected
- Auto-selection with visual confirmation when only one option available
- Obvious feedback that selection has been made

### Technical Requirements
- Add visual selection state to date picker component
- Implement auto-selection logic for single-option scenarios
- Ensure visual feedback is clear and accessible
- Test across different date availability scenarios

### Priority Justification
- **P2 Medium**: Improves user experience but not blocking
- **UX Enhancement**: Clear feedback improves booking flow
- **Easy Implementation**: UI state management update
</details>

<details>
<summary><strong>Bug #25:</strong> Share with Friends message contains extra information</summary>

### Title: Share with Friends message contains extra information
### Status: `OPEN` 🟢
### Priority: P2 Medium - Sharing feature cleanup
### Severity: 🟢 Low

### Issue
- **Problem:** "Share with Friends" button generates message with extra unwanted information
- **Impact:** Shared message is longer than intended, includes extraneous details
- **Affects:** Users sharing booking confirmations with friends

### Current Behavior
Message includes:
```
Soccer Trial Booking
<url>
We just signed up for a free trial soccer class with Soccer Stars of South Denver. You should sign up too! <url>
```

### Expected Behavior
- Message should only include content found in `/portal/settings`
- Clean, concise sharing message
- No extra URLs or redundant information

### Technical Requirements
- Review sharing message generation logic
- Ensure message pulls only from settings configuration
- Remove extra URL additions or redundant text
- Test sharing message format

### Priority Justification
- **P2 Medium**: Affects sharing experience but not core functionality
- **User Control**: Users should control message content via settings
- **Professional Standards**: Clean sharing messages reflect better on business
</details>

<details>
<summary><strong>Bug #26:</strong> Confirmation page needs Facebook/Instagram icons instead of text</summary>

### Title: Confirmation page needs Facebook/Instagram icons instead of text
### Status: `OPEN` 🟢
### Priority: P2 Medium - Social media integration
### Severity: 🟢 Low

### Issue
- **Problem:** Confirmation page has text links for Facebook/Instagram instead of proper icons
- **Impact:** Less engaging social media call-to-action, missed follow opportunities
- **Affects:** All users viewing booking confirmation page

### Current State
- Text-only links to social media platforms
- No visual icons or engaging call-to-action
- Missed opportunity for social media growth

### Expected Behavior
- Proper Facebook and Instagram icons as clickable links
- Clear call-to-action for users to follow social accounts
- Visual, engaging social media integration
- Professional social media presence

### Technical Requirements
- Add Facebook and Instagram icon components
- Implement proper linking to social media accounts
- Add engaging "Follow us" call-to-action text
- Ensure icons are accessible and properly styled

### Priority Justification
- **P2 Medium**: Enhances social media growth but not core functionality
- **Marketing Value**: Better social media integration supports business growth
- **Professional Standards**: Proper social media integration expected
</details>

<details>
<summary><strong>Bug #27:</strong> Settings page "How it works" boxes have inconsistent styling</summary>

### Title: Settings page "How it works" boxes have inconsistent styling
### Status: `OPEN` 🔴
### Priority: P2 Normal
### Severity: 🟢 Low

### Issue
The "How it works" information boxes across different sections of the `/portal/settings` page have slightly different styling, creating a lack of visual consistency.

### Expected Behavior
- All "How it works" boxes should use identical styling
- Consistent padding, margins, colors, typography
- Unified visual design language across the settings page

### Affected Areas
- `/portal/settings` page
- Various "How it works" informational sections

### Priority Justification
- Visual consistency improves user experience
- Minor UI enhancement, not blocking functionality
</details>

<details>
<summary><strong>Bug #28:</strong> Class names duplicated in Name column on classes page</summary>

### Title: Class names duplicated in Name column on classes page  
### Status: `OPEN` 🔴
### Priority: P1 High
### Severity: 🟡 Medium

### Issue
The Name column on the `/portal/classes` page shows class names duplicated - one on top of the other in the same cell.

### Expected Behavior
- Class name should appear once per row in the Name column
- Clear, readable display without duplication

### Affected Areas
- `/portal/classes` page
- Classes table Name column

### Priority Justification
- Medium impact: Affects readability and looks unprofessional
- Data display issue that could confuse users
</details>

<details>
<summary><strong>Bug #29:</strong> Asterisk color inconsistency across required fields</summary>

### Title: Asterisk color inconsistency across required fields
### Status: `OPEN` 🔴  
### Priority: P2 Normal
### Severity: 🟢 Low

### Issue
Required field indicators (asterisks) appear in different colors across the application:
- Some are red (TextInput with `required` attribute)
- Some are black (manually added text '*')
- Checkbox required indicators should match TextInput styling

### Expected Behavior  
- All required field indicators should be red
- Consistent styling for `required` attribute across all form elements
- Checkboxes should have a `required` prop similar to TextInput

### Affected Areas
- Form components across the application
- Booking forms, settings forms, lead capture forms

### Priority Justification
- Improves visual consistency and user experience
- Low priority as it doesn't affect functionality
</details>

<details>
<summary><strong>Bug #30:</strong> Parent/Guardian form red asterisk on newline instead of inline</summary>

### Title: Parent/Guardian form red asterisk on newline instead of inline
### Status: `OPEN` 🔴
### Priority: P2 Normal  
### Severity: 🟢 Low

### Issue
In the Parent/Guardian Information form during booking flow, the red required asterisk appears on a new line below the field label instead of inline with the label text.

### Expected Behavior
- Required asterisk should appear on the same line as the TextInput title
- Consistent with other form styling patterns

### Affected Areas
- `ParentGuardianForm.tsx` 
- Booking flow forms

### Priority Justification
- Minor visual improvement
- Consistency with other form elements
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