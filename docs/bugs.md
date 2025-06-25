# 🐞 Bug Tracker

> **Last Updated:** 24 Jun 2025  
> **Active Issues:** 0 | **Resolved:** 5

---

## 🔴 Open Issues

| ID | Title | Severity | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------------|---------|
| *No open issues* | | | | | |

---

## ✅ Resolved Issues

| ID | Title | Resolution | Commit | Resolved |
|----|-------|------------|---------|----------|
| #1 | Landing page shows hardcoded contact info | Replaced with dynamic franchisee data | `b96eed9` | 2025-06-24 |
| #2 | Dropdown menus transparent/unreadable | Migrated to Mantine v8 + z-index fixes | `6e9d494` | 2025-06-24 |
| #3 | Contact info missing from landing page footer | Fixed public page data fetching by slug | `ff6dac4` | 2025-06-24 |
| #4 | Leads table "View Details" and "Edit Lead" redundant | Both actions now navigate to Lead Details page | `ff6dac4` | 2025-06-24 |
| #5 | Classes column shows "0" instead of actual count | Updated useLocations hook with class counts | `ff6dac4` | 2025-06-24 |

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