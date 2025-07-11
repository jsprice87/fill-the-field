# Current Task List - Portal & Public-Facing Issues
> **Generated:** 10 Jul 2025  
> **Focus:** Portal functionality and public-facing bugs (Admin tracked separately)

## Priority Matrix

### 🔴 P1 Critical (Immediate)
- **Bug #36**: Email confirmation broken - BLOCKS user registration

### 🟡 P2 High Priority (Short-term)
- **Bug #31**: Map location positioning (Lilley Gulch)
- **Bug #34**: Portal table white space and pagination issues

### 🟢 P3 Medium Priority (Next iteration)
- **Bug #32**: Login error feedback
- **Bug #33**: Dark mode button non-functional

**Note:** Admin section issues (#35, #37, #38, #43) and Feature #15 are tracked separately in `tasks-prd-admin-section.md`

---

## Relevant Files

- `src/pages/auth/EmailConfirmation.tsx` - Email confirmation flow
- `src/components/auth/AuthCallback.tsx` - Auth callback handling
- `src/components/maps/MapStateManager.tsx` - Map location positioning
- `src/hooks/useGeocoding.ts` - Geocoding functionality
- `src/components/portal/LeadsTable.tsx` - Portal table pagination
- `src/components/portal/BookingsTable.tsx` - Portal table pagination
- `src/components/portal/LocationsTable.tsx` - Portal table pagination
- `src/components/auth/LoginForm.tsx` - Login error handling
- `src/components/portal/ThemeToggle.tsx` - Dark mode functionality
- `src/components/portal/Sidebar.tsx` - Portal theme system

---

## Tasks

- [ ] 1.0 Fix Critical User Registration Flow (P1 Critical)
  - [ ] 1.1 Investigate email confirmation redirect/loading issues
  - [ ] 1.2 Check Supabase auth configuration and email templates
  - [ ] 1.3 Verify auth callback handling and error states
  - [ ] 1.4 Test complete registration and confirmation flow
  - [ ] 1.5 Ensure proper success/error messaging

- [ ] 2.0 Fix High-Priority UX Issues (P2 High Priority)
  - [ ] 2.1 Fix map location positioning for Lilley Gulch (verify zip code usage)
  - [ ] 2.2 Improve portal table pagination and reduce white space
  - [ ] 2.3 Add configurable rows per page (10, 25, 50, 100)
  - [ ] 2.4 Implement sticky pagination controls at viewport bottom

- [ ] 3.0 Implement Authentication and UI Improvements (P3 Medium Priority)
  - [ ] 3.1 Add specific error feedback to login screen
  - [ ] 3.2 Fix dark mode button functionality in portal
  - [ ] 3.3 Ensure theme persistence across sessions

---

## Implementation Strategy

1. **Start with Task 1.0** - Email confirmation is blocking user registration
2. **Move to Task 2.0** - High-priority UX issues affecting daily operations
3. **Continue with Task 3.0** - Medium priority improvements for polish
4. **Push changes after each major task** for testing and validation

## Next Steps

Begin with **Task 1.1**: Investigate email confirmation redirect/loading issues - this is blocking new user registrations.

**CRITICAL**: Stop and push all progress for testing after completing each major task (1.0, 2.0, 3.0) before proceeding to the next.