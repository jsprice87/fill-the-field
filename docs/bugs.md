# 🐞 Bug Report – 24 Jun 2025

---

## 1 Summary
Landing Page shows wrong franchisee contact info + address (privacy leak)

## 2 Environment
- **App build:** `preview-2025-06-24`
- **Deployment URL:** `https://preview--fill-the-field.lovable.app`
- **Browser / OS:** `Chrome 125 macOS`
- **Logged-in role:** *public / unauthenticated*

## 3 Steps to Reproduce
1. Open a franchisee landing page – e.g.  
   `https://fill-the-field.fun/free-trial/soccer-stars-of-south-denver`.
2. Scroll to the footer (or reach final *Confirm Booking* step).
3. Observe the contact block.

## 4 Expected Result
Footer **pulls data from** `/portal/settings → Contact Information`.  
*Public versions* should show **phone + email only** (no street address).

## 5 Actual Result
- Phone/e-mail are hard-coded to a generic “Lovable Test” contact.  
- Street address is displayed, exposing private info.

## 6 Impact & Severity
| Users Affected | Frequency | Severity |
|----------------|-----------|----------|
| Prospective parents | 100 % | 🟠 **High** (brand & privacy) |

## 7 Logs & Diagnostics
*(N/A – purely UI data binding issue).*

## 8 Root-Cause Notes <!-- editable by dev/AI -->
<!-- leave blank -->

## 9 Proposed Fix <!-- editable -->
<!-- leave blank -->

## 10 Status
- **Current:** `[OPEN]`
- **Assignee:** `unassigned`
- **Target release:** `v0.9.2`

---

## 1 Summary
Portal pop-up menus are transparent; text overlaps and becomes unreadable

## 2 Environment
- **App build:** `preview-2025-06-24`
- **Route:** `/:slug/portal/leads` (also bookings, classes, locations)
- **Browser / OS:** `Chrome 125 macOS`

## 3 Steps to Reproduce
1. Log in as franchisee → navigate to **Leads** page.
2. Click the three-dot *Actions* button in any table row.
3. The pop-up menu appears but background is transparent – underlying text shows through.

## 4 Expected Result
Menu has an opaque background (Mantine default `--mantine-color-filled`).  
Items clearly readable regardless of page content.

## 5 Actual Result
CSS override sets `background: transparent` → white text on white table.

## 6 Impact & Severity
| Users Affected | Frequency | Severity |
|----------------|-----------|----------|
| All portal users | 100 % | 🟡 **Medium** (usability) |

## 7 Logs & Diagnostics
Possible culprit: src/components/mantine/Menu.tsx overrides .mantine-Menu-dropdown { background: transparent; }

## 8 Root-Cause Notes <!-- editable by dev/AI -->
<!-- leave blank -->

## 9 Proposed Fix <!-- editable -->
<!-- leave blank -->

## 10 Status
- **Current:** `[OPEN]`
- **Assignee:** `unassigned`
- **Target release:** `v0.9.2`

