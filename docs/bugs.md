# 🐞 Bug Tracker

> **Last Updated:** 30 Jun 2025  
> **Active Issues:** 0 | **Resolved:** 22

---

## 🔴 Open Issues

| ID | Title | Severity | Priority | Assignee | Files Affected | Created |
|----|-------|----------|----------|----------|----------------|---------|

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