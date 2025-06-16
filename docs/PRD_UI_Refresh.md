# Product‑Requirements Document  
## UI Refresh – Fill the Field (Front‑end only)

### 1 · Problem Statement
The current portal UI feels dated, inconsistent, and cramped, which harms perceived quality and usability. Business logic and API calls are solid and **must stay unchanged**.

### 2 · Goals / Non‑Goals
| Item | In scope | Out of scope |
|------|----------|--------------|
| Modern, cohesive look & feel | ✔︎ | Any server / DB change |
| Tailwind 3 + shadcn/ui adoption | ✔︎ | Landing‑page color/font changes |
| Dark‑mode support | ✔︎ | New features beyond parity |
| Accessibility ≥ 95 Lighthouse | ✔︎ | Removing proven flows |

### 3 · Success Metrics
* Lighthouse **Accessibility ≥ 95** on every route.  
* User survey “Looks professional” ≥ 4 / 5 (baseline 2.1).  
* Zero failed e2e tests after merge.

### 4 · Functional Requirements
1. URLs / routing, auth, and CRUD remain identical.
2. Tables: sticky card header; only rows scroll (both axes).
3. Sidebar fixed (`z‑50`), collapsible < 1024 px, Drawer < 768 px.
4. Status badge becomes Radix dropdown (approved earlier).

### 5 · Non‑Functional Requirements
* **Tailwind 3**, **shadcn/ui**, **Radix‑UI**, **lucide‑react**.
* 200 ms `cubic‑bezier(0.4,0,0.2,1)` motion, dark‑mode true.
* No visual regressions on `/free‑trial/`.

### 6 · Assumptions & Open Questions
* Tokens override Tailwind globally except in `/free‑trial/`.
* Inline SVGs may be swapped for lucide equivalents.

### 7 · Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| CSS collision with legacy | Isolate via Tailwind preflight |
| Large PR merge pain | Deliver in phased branches |
| Dark‑mode contrast | Use Tailwind contrast plugin |

### 8 · Phased Road‑map & Tasks  
| Phase | Days | Key Tasks |
|-------|------|-----------|
| 0. Baseline + Storybook | 1 | Yarn upgrade, new Storybook |
| 1. Design tokens | 1 | Add color / spacing scale |
| 2. Shell refresh | 2 | Sidebar, layout, dark‑mode toggle |
| 3. UI primitives | 3 | Button, Card, Tooltip, Toggle |
| 4. Tables | 2 | Sticky header, RowMenu, badge selector |
| 5. Forms | 2 | Convert to shadcn Form + Dialog |
| 6. A11y / QA | 2 | axe‑core, Cypress |
| 7. Roll‑out | 1 | Preview, smoke tests |
| 8. Docs | 0.5 | README & wiki updates |

_Total ≈ 14 dev‑days._
