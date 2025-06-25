# PRD: Enhanced Lead Details Page

## Introduction/Overview

The current Lead Details page provides basic lead information but lacks comprehensive lead management capabilities. This enhancement will transform it into a full-featured lead management interface with three distinct sections: Lead Details, Bookings Management, and Notes History. The goal is to provide franchisees with a centralized view to manage all aspects of a lead's journey from initial contact through booking completion.

## Goals

1. **Centralized Lead Management**: Provide a single page where franchisees can view and manage all lead information, bookings, and communication history
2. **Improved Lead Tracking**: Enable easy status updates and comprehensive lead information display
3. **Booking Management**: Allow direct booking modifications (location, class, date changes) from the lead details page
4. **Communication History**: Maintain a chronological record of all interactions and notes about the lead
5. **Enhanced User Experience**: Reduce clicks and navigation required to manage leads effectively

## User Stories

- **As a franchisee**, I want to see all lead information at a glance so I can quickly understand the lead's current status and history
- **As a franchisee**, I want to update lead status easily so I can keep my pipeline accurate
- **As a franchisee**, I want to call or email leads directly from their details page so I can contact them quickly
- **As a franchisee**, I want to see all of a lead's bookings in one place so I can track their engagement
- **As a franchisee**, I want to modify booking details (class, location, date) so I can accommodate lead requests for changes
- **As a franchisee**, I want to add notes about leads so I can remember important details for future interactions
- **As a franchisee**, I want to see the history of all notes about a lead so I can understand the complete communication timeline

## Functional Requirements

### Lead Details Section
1. The system must display the lead's full name prominently at the top of the page
2. The system must show a status selector that allows changing to any status without workflow restrictions
3. The system must display quick action buttons for calling and emailing the lead
4. The system must show lead creation date as "lead age" (e.g., "3 days ago")
5. The system must display all lead information including:
   - Contact information (email, phone)
   - Demographics (zip code)
   - Preferences (selected location, child language setting)
   - Booking status (waiver status, notification preferences)
   - Lead source
6. The system must override automated status setting when a user manually changes the status
7. The system must maintain current lead information display while adding new fields

### Bookings Section
8. The system must display all bookings associated with the lead
9. The system must show "No bookings" message when no bookings exist
10. The system must display bookings as individual cards containing:
    - Class name
    - Location name
    - Date and time
    - Participant name and age
    - Additional notes from booking
11. The system must provide "Edit Booking" and "Cancel Booking" buttons on each booking card
12. The system must open a modal form for booking editing that pre-populates with existing data
13. The booking edit form must include cascading dropdowns:
    - Location dropdown (shows all available locations)
    - Classes dropdown (populated based on selected location)
    - Dates dropdown (populated based on selected class)
14. The system must allow saving booking changes and updating the display
15. The system must allow booking cancellation with confirmation

### Notes Section
16. The system must provide a text input field for adding new notes
17. The system must enforce a 255 character limit on notes
18. The system must automatically timestamp and attribute notes to the current user
19. The system must display notes in chronological order (newest first)
20. The system must show who created each note and when
21. The system must allow editing existing notes
22. The system must allow deleting existing notes with confirmation
23. The system must use plain text formatting for notes

### General Requirements
24. The system must be accessible to both Users and Admin roles
25. The system must include a "Back to Leads" button for navigation
26. The system must maintain responsive design for mobile and desktop use
27. The system must provide loading states for all async operations
28. The system must show appropriate error messages for failed operations
29. The system must validate all form inputs before submission

## Non-Goals (Out of Scope)

- Real-time collaborative editing of notes
- Rich text formatting for notes
- File attachments to notes
- Automated note creation from system events
- Status workflow restrictions (reserved for future enhancement)
- Bulk operations on multiple bookings
- Integration with external calendar systems
- Email/SMS sending directly from the page (quick actions open default apps)

## Design Considerations

- Use Mantine v8 components consistently with existing portal design
- Maintain three distinct sections with clear visual separation
- Use card layout for bookings to accommodate multiple data points
- Ensure modal forms follow existing design patterns
- Use existing status badge styling and color scheme
- Implement loading skeletons for better user experience
- Follow existing spacing and typography conventions

## Technical Considerations

- Integrate with existing Supabase database schema
- Use TanStack Query for data fetching and caching
- Implement proper error handling and user feedback
- Ensure database queries are efficient and properly filtered by franchisee
- Use existing authentication and authorization patterns
- Follow established routing patterns (/:franchiseeSlug/portal/leads/:leadId)
- Implement proper form validation using existing patterns
- Use existing toast notification system for user feedback

## Success Metrics

- All functional requirements are implemented and tested
- Page loads lead data within 2 seconds
- All form submissions complete successfully
- No regression in existing Lead Details functionality
- Mobile responsive design works on all target devices
- Error handling provides clear feedback to users
- Code follows existing project patterns and conventions

## Open Questions

- Should booking history (canceled/completed bookings) be shown separately from active bookings?
- Should there be a limit on the number of notes displayed initially (with "load more" option)?
- Should note editing have a time limit (e.g., only editable within 1 hour of creation)?
- Should system-generated events (status changes, booking creations) automatically create notes?