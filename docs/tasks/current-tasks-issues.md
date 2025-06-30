# Current Task List - Issue Processing
> **Generated:** 30 Jun 2025  
> **Focus:** High-priority bug fixes and UI improvements

## Priority Matrix

### 🔴 P1 High Priority (Immediate)
Issues affecting user experience, data display, or professional appearance

### 🟡 P2 Medium Priority (Short-term) 
Visual consistency and UX improvements

### 🟢 P3-P4 Low Priority (Backlog)
Minor improvements and cleanup tasks

---

## Relevant Files

- `src/pages/portal/Classes.tsx` - Classes page with duplicated names
- `src/components/booking/ParentGuardianForm.tsx` - Form with asterisk issues  
- `src/pages/portal/Settings.tsx` - Settings page styling inconsistencies
- `src/components/booking/ClassBooking.tsx` - Booking page styling
- `src/components/booking/BookingConfirmation.tsx` - Confirmation page styling
- `src/components/booking/ParentGuardianAgreements.tsx` - Agreements section issues
- `src/pages/FindClasses.tsx` - Find classes page branding
- Form components across application - Required field styling

---

## Tasks

- [ ] 1.0 Fix Critical Data Display Issues (P1 High Priority)
  - [ ] 1.1 Investigate and fix duplicated class names in /portal/classes Name column (#28)
  - [ ] 1.2 Fix Parent/Guardian form asterisk positioning issues (#19, #30)
  - [ ] 1.3 Add missing liability waiver link and rename agreements section (#22)

- [ ] 2.0 Improve User Experience and Professional Appearance (P1 High Priority)  
  - [ ] 2.1 Apply Soccer Stars styling to booking page (#20)
  - [ ] 2.2 Apply Soccer Stars styling to booking confirmation page (#21)
  - [ ] 2.3 Fix agreement checkboxes/icons alignment issues (#23)
  - [ ] 2.4 Add blue "how it works" section for language requirements (#18)

- [ ] 3.0 Standardize Visual Consistency (P2 Medium Priority)
  - [ ] 3.1 Unify "How it works" box styling across settings page (#27)
  - [ ] 3.2 Standardize required field asterisk colors across forms (#29)
  - [ ] 3.3 Apply Soccer Stars branding to find-classes page (#13)

- [ ] 4.0 User Interface Enhancements (P2 Medium Priority)
  - [ ] 4.1 Add visual date selection indicator to class date modal (#24)
  - [ ] 4.2 Clean up "Share with Friends" message content (#25) 
  - [ ] 4.3 Replace Facebook/Instagram text with icons on confirmation page (#26)

- [ ] 5.0 Cleanup and Minor Improvements (P3-P4 Low Priority)
  - [ ] 5.1 Fix duplicate asterisks on lead capture form fields (#15)
  - [ ] 5.2 Fix waiver editor not editable on first profile creation (#14)
  - [ ] 5.3 Remove map debug console logs from find-classes page (#16)
  - [ ] 5.4 Enhance bulk table actions beyond Archive only (#11)

---

## Implementation Strategy

1. **Start with Task 1.0** - Critical data display issues that affect user experience
2. **Move to Task 2.0** - Professional appearance improvements for customer-facing pages
3. **Continue with Task 3.0** - Visual consistency across portal pages
4. **Push changes after each major task** for testing and validation
5. **Complete remaining tasks** based on priority and available time

## Next Steps

Begin with **Task 1.1**: Investigate duplicated class names on classes page - this is a data display issue that looks unprofessional and could confuse users.