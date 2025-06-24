# 🐞 Bug Tracker

> **Last Updated:** 24 Jun 2025  
> **Active Issues:** 1 | **Resolved:** 1

---

## 🔴 Open Issues

| ID | Title | Severity | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------------|---------|
| #1 | Landing page shows hardcoded contact info | 🟠 High | unassigned | Landing page components | 2025-06-24 |

---

## ✅ Resolved Issues

| ID | Title | Resolution | Commit | Resolved |
|----|-------|------------|---------|----------|
| #2 | Dropdown menus transparent/unreadable | Migrated to Mantine v8 + z-index fixes | `pending` | 2025-06-24 |

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

### Status: `OPEN`
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