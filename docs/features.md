# 🚀 Feature Requests & Enhancements

> **Last Updated:** 24 Jun 2025  
> **Active Features:** 2 | **Completed:** 0

---

## 🔮 Planned Features

| ID | Title | Priority | Complexity | Assignee | Target Version |
|----|-------|----------|------------|----------|----------------|
| #1 | Enhanced Lead Details page with editing capabilities | 🟡 Medium | 🟡 Medium | unassigned | v0.9.3 |
| #2 | "Add Classes" button in Locations table actions | 🟢 Low | 🟢 Low | unassigned | v0.9.3 |

---

## ✅ Completed Features

| ID | Title | Completion Date | Version | Commit |
|----|-------|-----------------|---------|--------|
| *No completed features yet* | | | | |

---

## 📋 Feature Details

<details>
<summary><strong>Feature #1:</strong> Enhanced Lead Details page with editing capabilities</summary>

### Description
Enhance the existing Lead Details page to become a comprehensive lead management interface with full editing capabilities, contact actions, and note-taking functionality.

### Current State
- Basic Lead Details page exists at `/portal/leads/:leadId`
- Shows lead information and basic details
- "View Details" and "Edit Lead" actions both navigate to the same page

### Proposed Enhancements
1. **Status Editing**: Add ability to change lead status directly from the details page
2. **Notes Section**: Add section for adding/viewing timestamped notes about the lead
3. **Contact Actions**: Add quick action buttons for calling/emailing the lead
4. **Related Data**: Display associated bookings, participants, and class interests
5. **Activity Timeline**: Show chronological history of status changes, notes, and interactions

### Technical Requirements
- Add inline status editing component
- Create notes CRUD functionality with timestamps
- Implement activity log/timeline component
- Add contact action buttons with proper tel:/mailto: links
- Ensure all changes invalidate relevant cache queries

### Acceptance Criteria
- [ ] Can edit lead status from details page
- [ ] Can add timestamped notes visible to user later
- [ ] Quick contact buttons work properly
- [ ] Shows related bookings and participants
- [ ] Activity timeline shows all interactions

### Priority: Medium
- **Business Value**: High - improves lead management workflow
- **Development Effort**: Medium - requires several new components
- **Dependencies**: None

</details>

<details>
<summary><strong>Feature #2:</strong> "Add Classes" button in Locations table actions</summary>

### Description
Add an "Add Classes" action button to the Locations table row menu that navigates directly to the Add Classes page with the location pre-selected.

### Current State
- Locations table has Edit, Archive/Unarchive, and Delete actions
- Add Classes page exists but requires manual location selection
- No direct link from location to class creation

### Proposed Enhancement
Add "Add Classes" menu item to TableRowMenu that:
1. Navigates to the Add Classes page
2. Pre-selects the clicked location in the location dropdown
3. Streamlines workflow for adding classes to specific locations

### Technical Requirements
- Add new action to TableRowMenu component
- Modify Add Classes page to accept location ID parameter
- Update routing to support pre-selected location
- Ensure location selection is properly populated

### Implementation Details
- Update `TableRowMenu` component with new action prop
- Navigate to `/portal/classes/add?location=${locationId}`
- Modify Add Classes form to read and pre-select location from URL params

### Acceptance Criteria
- [ ] "Add Classes" button appears in Locations table actions
- [ ] Clicking button navigates to Add Classes page
- [ ] Location is pre-selected in the form
- [ ] User can still change location if needed
- [ ] Form functions normally after pre-selection

### Priority: Low
- **Business Value**: Medium - improves workflow efficiency
- **Development Effort**: Low - simple navigation enhancement
- **Dependencies**: None

</details>

---

## 🏗️ Implementation Notes

### Development Process
1. **Feature Requests**: New features should be added using the template below
2. **Complexity Assessment**: 
   - 🟢 Low: 1-2 hours of development
   - 🟡 Medium: 3-8 hours of development  
   - 🟠 High: 1-2 days of development
   - 🔴 Epic: Multiple days or iterations
3. **Priority Levels**:
   - 🟢 Low: Nice to have, no urgency
   - 🟡 Medium: Improves workflow, moderate business value
   - 🟠 High: Important for user experience
   - 🔴 Critical: Blocking or major business impact

### Feature Template
```markdown
## Feature #X: [Title]
- **Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
- **Complexity:** 🔴 Epic | 🟠 High | 🟡 Medium | 🟢 Low  
- **Description:** [What the feature does]
- **Business Value:** [Why this feature is needed]
- **Technical Requirements:** [Implementation details]
- **Acceptance Criteria:** [Testable requirements]
```

### Workflow
1. **New Feature**: Add to "Planned Features" table
2. **In Development**: Move to in-progress status
3. **Completed**: Move to "Completed Features" with commit hash
4. **Testing**: Verify acceptance criteria are met
5. **Documentation**: Update relevant docs if needed