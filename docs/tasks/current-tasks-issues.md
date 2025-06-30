# Current Task List - Feature Implementation & New Issues
> **Generated:** 30 Jun 2025  
> **Focus:** Feature implementation and new bug fixes

## Priority Matrix

### 🔴 P1 High Priority (Immediate)
New critical bugs affecting user experience

### 🟡 P2 Medium Priority (Short-term) 
Features and enhancements for workflow improvement

### 🟢 P3-P4 Low Priority (Backlog)
Nice-to-have features and interface improvements

---

## Relevant Files

- `src/pages/FindClasses.tsx` - Find classes page for date/age range display
- `src/components/maps/MapStateManager.tsx` - Map functionality and location positioning
- `src/components/maps/LocationCard.tsx` - Location display components
- `src/hooks/useLocations.ts` - Location data fetching and geocoding
- `src/pages/portal/Profile.tsx` - Profile page with business info section
- `src/components/portal/PasswordChangeCard.tsx` - Password management component
- `src/components/locations/LocationsTable.tsx` - Locations table for bulk actions
- `src/components/classes/ClassesTable.tsx` - Classes table for bulk actions
- `src/components/portal/Sidebar.tsx` - Portal sidebar for collapsible functionality
- `src/components/admin/Sidebar.tsx` - Admin sidebar for collapsible functionality

---

## Tasks

- [ ] 1.0 Fix Critical Location & Display Issues (P1 High Priority)
  - [ ] 1.1 Fix map location positioning bug for Lilley Gulch (#31)
  - [ ] 1.2 Verify zip code usage in geocoding functionality
  - [ ] 1.3 Add location validation and debugging tools

- [ ] 2.0 Implement High-Priority Features (P1-P2 Medium Priority)
  - [ ] 2.1 Add password management to profile page (#9)
  - [ ] 2.2 Add date range and age range display to find-classes page (#13)
  - [ ] 2.3 Implement bulk actions for locations and classes tables (#12)

- [ ] 3.0 Portal UX Improvements (P2-P3 Low Priority)
  - [ ] 3.1 Implement collapsible portal/admin sidebars (#7)
  - [ ] 3.2 Remove redundant business info from profile page (#10)
  - [ ] 3.3 Enhance notification system with advanced features (#6)

---

## Implementation Strategy

1. **Start with Task 1.0** - Critical map location bug affecting user experience
2. **Move to Task 2.0** - High-priority features that improve core functionality
3. **Continue with Task 3.0** - UX improvements and advanced features
4. **Push changes after each major task** for testing and validation
5. **Complete remaining tasks** based on priority and available time

## Next Steps

Begin with **Task 1.1**: Investigate and fix the map location positioning bug for Lilley Gulch - this is a critical user experience issue that affects location accuracy.