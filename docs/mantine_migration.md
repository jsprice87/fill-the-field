
# Mantine Migration Guide  
**Fill the Field – Front‑End**

---

## 0 · Purpose

We will migrate from **shadcn‑ui (Radix + Tailwind)** to **Mantine** while **keeping production stable** and **retaining the new design overhaul completed in Tasks 1‑9**.  
This document provides:

1. **Component‑by‑component mapping** – which Mantine component replaces each shadcn/Radix primitive or bespoke component.  
2. **Theming strategy** – single source of truth for colours, fonts, spacing, radius and shadows.  
3. **Styled‑system decision** – Tailwind **remains** for layout utilities; Mantine's CSS‑in‑JS handles component–scoped styles.  
4. **Phased checklist** – nine atomic migration phases with "definition‑of‑done" for each phase, QA gates and roll‑back notes.

All links reference Mantine v7.x docs (last verified 2025‑06‑16).  
Repository: <https://github.com/mantinedev/mantine>

---

## 1 · Project Level Setup ✅ COMPLETE

| Step | Command / File | Notes |
|------|----------------|-------|
| 1.1  | `pnpm add @mantine/core @mantine/hooks @mantine/notifications @mantine/dates` | Core + hooks + overlay + date‑picker. |
| 1.2  | `pnpm add @emotion/react @emotion/styled` | Mantine's default styling engine. |
| 1.3  | `pnpm dlx mantine-cli@latest add theme` | Generates `src/mantine-theme.ts`. |
| 1.4  | `src/main.tsx` | Wrap `<App />` with `<MantineProvider>` and `<Notifications />`. |
| 1.5  | Vite/CRACO config | *No change* – Mantine works with plain React + Vite (already used). |

---

## 2 · Theming Strategy ✅ COMPLETE

### 2.1 Colour Palette  
> **Rule:** Keep existing marketing colours on **`/free-trial/`**, otherwise adopt Mantine defaults tweaked to Style Guidelines.

| Semantic Token        | Hex (light) | Hex (dark) | Usage                                   |
|-----------------------|-------------|-----------|-----------------------------------------|
| `primary.6`           | `#10B981`   | `#10B981` | Brand emerald (buttons, toggles).       |
| `primary.3`           | `#6EE7B7`   | `#047857` | Hover / subtle backgrounds.             |
| `danger.6`            | `#EF4444`   | `#F87171` | Destructive actions.                    |
| `gray.0` → `gray.9`   | Mantine gray scale | Mantine gray scale | Text / backgrounds. |

Add to `mantine-theme.ts`:

```ts
export const theme: MantineThemeOverride = {
  primaryColor: 'primary',
  colors: {
    primary: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
  },
  fontFamily: 'Inter, sans-serif',
  radius: { md: 8 },
};
```

### 2.2 Typography ✅ COMPLETE
- **Headings:** `font-family: Inter, sans-serif; font-weight: 600;`
- **Body:** Mantine default (Inter).
- **Code:** `Menlo, ui-monospace`.

### 2.3 Shadow & Radius ✅ COMPLETE
- Use Mantine default shadows (`sm`, `md`).
- Radius globally set to `8px`; buttons override via prop when pill‑style needed.

---

## 3 · Styled‑System Decision ✅ COMPLETE

| Concern | Decision |
|---------|----------|
| Layout utilities | Keep Tailwind (`flex`, `grid`, `p-x`, responsive breakpoints). |
| Component styles | Use Mantine props / vars (`variant`, `size`, `style` prop, Emotion `sx`). |
| Global CSS | Tailwind base + custom tokens only; purge shadcn component styles after migration. |

**Reasoning:** avoids rewriting every layout class while leveraging Mantine variants for consistent theming.

---

## 4 · Component Mapping Table ✅ COMPLETE

| Current Component (src) | Mantine Replacement | Notes / Props |
|------------------------|---------------------|---------------|
| `@/components/ui/Button` (shadcn) | `<Button>` from `@mantine/core` | Pass `variant="filled"` / `"outline"`. |
| `@/components/ui/Input` / `Textarea` | `<TextInput>` / `<Textarea>` | Use `withAsterisk` for required. |
| Radix Switch | `<Switch>` | Controlled via form libs. |
| Radix DropdownMenu + custom styling | `<Menu>` | `withinPortal` for overlay stacking. |
| Radix Dialog / AlertDialog | `<Modal>` / `<ConfirmModal>` (`@mantine/modals`) | Replace custom focus traps. |
| shadcn Tooltip | `<Tooltip>` | Add `label`. |
| Custom Table w/ sticky headers | `<Table.ScrollContainer>` + `<ScrollArea>` | Use `stickyHeader` prop. |
| StatusBadgeSelector (custom) | `<Badge>` + `<Menu>` | Render badge as trigger. |
| Pagination (custom) | `<Pagination>` | Controlled variant. |
| Toast (useToast) custom | Replace with `<Notifications />` API | Use `showNotification`. |
| Accordion (Radix) | `<Accordion>` | Keep props parity. |

---

## 5 · Phased Checklist

### Phase 0 — Scaffolding ✅ COMPLETE
- [x] Install packages (Section 1).
- [x] Create `mantine-theme.ts` and wrap app.
- [x] Add `<Notifications />` root level.

**Gate:** App boots with no visual regressions.

---

### Phase 1 — Design Tokens ✅ COMPLETE
- [x] Apply colour palette, radius, typography in theme.
- [x] Add GlobalStyles to reset body background / font.
- [x] Update Storybook (if present) to load MantineProvider.

**Gate:** New `{Button variant="filled"}` renders in brand green.

---

### Phase 2 — Primitive Replacement ✅ COMPLETE
- [x] Replace all `<Button>` imports with Mantine.
- [x] Replace all form inputs (Input, Select, Textarea).
- [x] Remove corresponding shadcn component files.

**Gate:** CI passes; booking flow works.

---

### Phase 3 — Overlays & Menus ✅ COMPLETE (Previously completed)
- [x] Swap Radix Dialog, DropdownMenu, Tooltip with Mantine equivalents.
- [x] Verify focus‑trap and screen‑reader behaviour.

**Gate:** Accessibility audit (axe) passes.

---

### Phase 4 — Tables & Scroll Areas (NEXT PHASE)
- [ ] Wrap Bookings / Leads table bodies in `<ScrollArea h="calc(100vh-240px)">`.
- [ ] Use `Table.ScrollContainer minWidth={900}` for side‑scroll.
- [ ] Keep header cards sticky at top via CSS (`position: sticky; top: 0; z-index: 1`).

**Gate:** Manual QA on 1280px‐width and iPhone 14.

---

### Phase 5 — Status & Actions Refactor
- [ ] Re‑implement StatusBadgeSelector with Mantine `<Badge>` + `<Menu>`.
- [ ] Integrate `Menu.Item` icons (`IconCheck`, etc.).
- [ ] Replace Action column ellipsis with Mantine `<Menu>` trigger.

**Gate:** Status update mutation still fires; no visual gap.

---

### Phase 6 — Navigation & Sidebar
- [ ] Re‑create sidebar using Mantine `<Navbar>` + `<NavLink>`.
- [ ] Keep z‑index rules; copy‑link button uses `<ActionIcon variant="subtle">`.
- [ ] Ensure dark‑mode toggle with `<ColorSchemeProvider>` (optional).

**Gate:** Layout stable; nav does not overlap scroll.

---

### Phase 7 — Forms & Validation
- [ ] Integrate Mantine `<Form />` (or keep react‑hook‑form) with `useForm`.
- [ ] Replace custom error messages with Mantine's `error` prop.

**Gate:** Submit/validation flows unchanged.

---

### Phase 8 — Notifications & Feedback
- [ ] Replace `useToast` calls with `showNotification`.
- [ ] Standardise success (green), error (red), info (blue) variants.

**Gate:** Creating a booking shows proper toast.

---

### Phase 9 — Cleanup & Removal
- [ ] Delete all unused shadcn components.
- [ ] Remove Radix CSS packages from `package.json`.
- [ ] Run `pnpm dlx @mantine/eslint-plugin lint --fix`.

**Gate:** Lighthouse score ≥ 98, bundle size check.

---

## 6 · QA / Roll‑back Strategy

Each phase lives in its own PR.
Merge only after:
1. Unit tests pass.
2. Manual smoke test for booking + lead flow.
3. Visual regression snapshots (Chromatic or Percy).

**Rollback** = revert last PR; data layer untouched.

---

## 7 · Questions Checklist for Contributors

Before opening a PR, ensure you have verified:
- [ ] Does the component use Mantine props instead of inline Tailwind where possible?
- [ ] Have you removed the corresponding shadcn import?
- [ ] Did you update Storybook stories?
- [ ] Does the linter show zero emotion‑related warnings?
- [ ] If uncertain about UX change, did you ask in #design-review Slack?

---

## 8 · Resources
- **Mantine Docs:** https://mantine.dev/core/getting-started/
- **Mantine v7 Migration Notes:** https://mantine.dev/guides/v7-migration/
- **Notifications API:** https://mantine.dev/notifications/
- **ScrollArea / Table docs:** https://mantine.dev/core/table/

---

**Phase 2 Migration Complete!** 
- ✅ All Button, Input, Textarea, Select components now use Mantine
- ✅ Soccer Stars branding preserved with custom variants
- ✅ Storybook integration complete with new primitive stories
- ✅ All critical user flows tested and functional

**Next:** Proceed to Phase 4 (Phase 3 was completed earlier)

---

**End of file – happy migrating!**
