# 🐞 Bug Tracker

> **Last Updated:** 26 Jun 2025  
> **Active Issues:** 4 | **Resolved:** 7

---

## 🔴 Open Issues

| ID | Title | Severity | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------------|---------|
| #7 | Portal bookings page long load time and missing data | 🟠 High | unassigned | portal/Bookings.tsx | 2025-06-26 |
| #9 | Location selector transparent on program creation page | 🟡 Medium | unassigned | portal/Classes.tsx | 2025-06-26 |
| #10 | Lead Details booking data combination issue | 🟡 Medium | unassigned | LeadDetailsBookings | 2025-06-26 |
| #11 | Bulk table actions limited to Archive only | 🟢 Low | unassigned | LeadsTable.tsx | 2025-06-26 |

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
| #8 | Liability waiver 404 error and opens new page | Replaced href link with WaiverModal popup | `56efdf9` | 2025-06-26 |

---

## 📋 Bug Details

<details>
<summary><strong>Bug #1:</strong> Landing page shows hardcoded contact info</summary>

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

### Status: `RESOLVED` ✅

**Resolution Implemented:**
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
<summary><strong>Bug #2:</strong> Dropdown menus transparent/unreadable ✅ RESOLVED</summary>

### Issue
- **Problem:** Portal dropdown menus (status filters, location filters) had transparent backgrounds
- **Impact:** Text became unreadable when overlapping with table content
- **Affects:** All portal pages with dropdowns (Leads, Bookings, Classes)

### Root Cause
1. **Component mismatch:** Portal was using shadcn/ui Select instead of Mantine components
2. **Z-index conflict:** Sticky table headers (z-index: 2) vs dropdown content (default z-index)
3. **Missing portal configuration:** Dropdowns not using `withinPortal` prop

### Resolution
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

### Status: `RESOLVED` 2025-06-24
</details>

<details>
<summary><strong>Bug #3:</strong> Contact info missing from landing page footer ✅ RESOLVED</summary>

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

### Files Modified
- `src/pages/booking/BookingLanding.tsx` (lines 28-59, 282-298)

### Status: `RESOLVED` ✅ 2025-06-24
</details>

<details>
<summary><strong>Bug #4:</strong> Leads table "View Details" and "Edit Lead" redundant ✅ RESOLVED</summary>

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

### Files Modified
- `src/components/leads/LeadsTable.tsx` (lines 2, 25, 111-113, 240-251)

### Status: `RESOLVED` ✅ 2025-06-24
</details>

<details>
<summary><strong>Bug #5:</strong> Classes column shows "0" instead of actual count ✅ RESOLVED</summary>

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

### Files Modified
- `src/hooks/useLocations.ts` (lines 17, 23-81)
- `src/components/locations/LocationsTable.tsx` (line 118)
- `src/components/locations/LocationCard.tsx` (line 24)

### Status: `RESOLVED` ✅ 2025-06-24
</details>

<details>
<summary><strong>Bug #6:</strong> Booking flow Parent Guardian Information panel issues</summary>

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

### Priority: High - affects core booking functionality

### Status: `RESOLVED` ✅ 2025-06-26

**Resolution Implemented:**
1. **Pre-population fix**: Added useEffect to auto-populate parent form with lead data captured on landing page
2. **Component migration**: Replaced shadcn/ui Input components with Mantine TextInput for consistent responsiveness
3. **Dropdown visibility**: Replaced shadcn/ui Select with Mantine Select + withinPortal prop to fix transparency

**Files Modified:**
- `src/components/booking/ParentGuardianForm.tsx` - Complete migration to Mantine components with data pre-population

**Result:** All three issues resolved - form now pre-populates, inputs are responsive, and dropdown is visible with proper styling.
</details>

<details>
<summary><strong>Bug #7:</strong> Portal bookings page long load time and missing data</summary>

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

### Technical Notes
- Bookings confirmed to exist in database via direct query
- Likely issue with data fetching query or RLS policies
- May be related to relationship joins or filtering logic

### Priority: High - core business functionality broken

### Status: `RESOLVED` 🔴
</details>

<details>
<summary><strong>Bug #8:</strong> Liability waiver 404 error and opens new page</summary>

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

### Priority: Medium - blocks booking completion

### Status: `RESOLVED` ✅ 2025-06-26

**Resolution Implemented:**
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

### Issue
- **Problem:** Location selector dropdown menu is transparent on program/class creation page
- **Impact:** Dropdown text unreadable due to background content showing through
- **Affects:** Portal users creating new programs/classes

### Expected Behavior
- Location selector should have proper background opacity
- Dropdown text should be clearly readable
- Consistent with other portal dropdown styling

### Technical Notes
- Similar to Bug #2 (resolved) but affecting different components
- Likely needs Mantine component migration or z-index fix
- Should use established dropdown styling patterns

### Priority: Medium - affects portal functionality

### Status: `OPEN` 🔴
</details>

<details>
<summary><strong>Bug #10:</strong> Lead Details booking data combination issue</summary>

### Issue
- **Problem:** Multiple bookings (Ada + Charlie) are being combined into single booking display
- **Impact:** Incorrect booking information shown, potential data confusion
- **Affects:** Lead Details page booking section

### Expected Behavior
- Each booking should be displayed separately
- Individual participant information should be distinct
- Booking cards should not merge multiple bookings

### Technical Notes
- Likely issue in booking data aggregation logic
- May be related to participant grouping or booking relationship queries
- Check LeadBookingsSection component logic

### Priority: Medium - data accuracy issue

### Status: `OPEN` 🔴
</details>

<details>
<summary><strong>Bug #11:</strong> Bulk table actions limited to Archive only</summary>

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

### Priority: Low - workflow improvement

### Status: `OPEN` 🔴
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