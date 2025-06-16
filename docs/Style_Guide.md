# Style Guidelines – Fill the Field (2025 Refresh)

## 1 · Color Tokens
| Token | Hex | Use |
|-------|-----|-----|
| primary‑50  | #ECFDF5 | subtle bgs |
| primary‑500 | #10B981 | CTAs, toggles |
| primary‑600 | #059669 | hover CTAs |
| primary‑700 | #047857 | pressed |
| gray‑50     | #F9FAFB | app bg |
| gray‑100    | #F3F4F6 | card bg |
| gray‑700    | #374151 | body text |
| gray‑900    | #111827 | headings |
| error‑500   | #EF4444 | destructive |
| warning‑500 | #F59E0B | warn badge |
| success‑500 | #22C55E | success badge |

**Note:** `/free‑trial/` keeps its existing palette.

## 2 · Typography
Family **Inter**, fallback `ui‑sans‑serif`.

| Role | Size / Line | Weight |
|------|-------------|--------|
| h1 | 30 / 36 | 600 |
| h2 | 24 / 32 | 600 |
| h3 | 20 / 28 | 600 |
| body‑lg | 16 / 24 | 400 |
| body‑sm | 14 / 20 | 400 |
| code | 13 / 20 | 500 |

## 3 · Spacing & Layout
* 4‑pt grid (`tailwind 1 = 4 px`).
* Max width 1280 px.
* Sidebar 240 px (72 px collapsed).
* Card padding 24 px (lg) / 16 px (sm).
* Table cell `py‑3 px‑4`.

## 4 · Iconography
* **lucide‑react** 24 × 24, stroke 1.5.
* Gap between icon & label `gap‑2`.

## 5 · Interaction States
| State | Effect |
|-------|--------|
| Hover | `opacity‑90` + translate‑y‑0.5 |
| Pressed | `scale‑95` |
| Focus | `outline‑2 outline‑primary‑500 outline‑offset‑2` |
| Disabled | `opacity‑50 cursor‑not‑allowed` |

## 6 · Motion
Duration 200 ms, easing `cubic‑bezier(0.4,0,0.2,1)` for sidebar, dropdown, dialogs.

## 7 · Component Catalogue
| Component | Path | Notes |
|-----------|------|-------|
| Button                | `components/ui/button.tsx` |
| Toggle (pill)         | `components/ui/toggle.tsx` |
| StatusBadgeSelector   | `components/ui/status‑badge‑selector.tsx` |
| TableRowMenu          | `components/ui/table‑row‑menu.tsx` |
| Card                  | `components/ui/card.tsx` |
| Tooltip               | `components/ui/tooltip.tsx` |

## 8 · Dark‑Mode
`class="dark"` on `<html>`. Swap gray‑50↔gray‑900, gray‑700↔gray‑300.

## 9 · Quality Checklist
* **WCAG AA** contrast ≥ 4.5.  
* axe‑core: zero critical issues.  
* Icon‑only buttons have `aria‑label`.  
* Respect `prefers‑reduced‑motion`.
