# 🐞 Bug Tracker

> **Last Updated:** 24 Jun 2025  
> **Active Issues:** 0 | **Resolved:** 2

---

## 🔴 Open Issues

| ID | Title | Severity | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------------|---------|
| *No open issues* | | | | | |

---

## ✅ Resolved Issues

| ID | Title | Resolution | Commit | Resolved |
|----|-------|------------|---------|----------|
| #1 | Landing page shows hardcoded contact info | Replaced with dynamic franchisee data | `pending` | 2025-06-24 |
| #2 | Dropdown menus transparent/unreadable | Migrated to Mantine v8 + z-index fixes | `6e9d494` | 2025-06-24 |

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

---

## 🔧 Quick Actions

- **Add New Bug:** Copy template below
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