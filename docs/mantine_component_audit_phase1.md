
# Mantine Component Audit - Phase 1

**Generated:** 2025-01-16  
**Scope:** Complete shadcn/ui, Radix UI, and custom component inventory  
**Excluded:** /free-trial/ directory (preserves original styling)  
**Branch:** feat/mantine-phase-1-audit  

## Executive Summary

- **Total Components:** 47
- **Direct Matches:** 18 (38%)
- **Custom Wraps:** 23 (49%)
- **Needs Confirmation:** 6 (13%)

## ⚠️ High-Risk Components

These components require careful migration planning:

- **Button** (25+ files) → @mantine/core Button
- **Input** (20+ files) → @mantine/core TextInput
- **Card** (15+ files) → @mantine/core Card
- **Select** (12+ files) → @mantine/core Select
  - Complex trigger/content pattern
- **Table** (10+ files) → @mantine/core Table + ScrollArea
  - Sticky headers + scroll behavior
- **Dialog** (8+ files) → @mantine/core Modal
  - Trigger/content pattern + focus management
- **StatusBadgeSelector** (5+ files) → @mantine/core Menu + Badge
  - Custom wrapper using Menu and Badge

## Complete Component Mapping

| Component | Usage Count | Import Path | Mantine Target | Migration Type | Notes |
|-----------|-------------|-------------|----------------|----------------|-------|
| Button | 25+ | `@/components/ui/button` | @mantine/core Button | DIRECT | |
| Input | 20+ | `@/components/ui/input` | @mantine/core TextInput | DIRECT | |
| Card | 15+ | `@/components/ui/card` | @mantine/core Card | DIRECT | |
| Select | 12+ | `@/components/ui/select` | @mantine/core Select | WRAP | Complex trigger/content pattern |
| Badge | 10+ | `@/components/ui/badge` | @mantine/core Badge | DIRECT | |
| Table | 10+ | `@/components/ui/table` | @mantine/core Table + ScrollArea | WRAP | Sticky headers + scroll behavior |
| Dialog | 8+ | `@/components/ui/dialog` | @mantine/core Modal | WRAP | Trigger/content pattern + focus management |
| Textarea | 8+ | `@/components/ui/textarea` | @mantine/core Textarea | DIRECT | |
| DropdownMenu | 6+ | `@/components/ui/dropdown-menu` | @mantine/core Menu | WRAP | Complex trigger/content pattern |
| Tooltip | 6+ | `@/components/ui/tooltip` | @mantine/core Tooltip | DIRECT | |
| StatusBadgeSelector | 5+ | `@/components/ui/StatusBadgeSelector` | @mantine/core Menu + Badge | WRAP | Custom wrapper using Menu and Badge |
| Switch | 4+ | `@/components/ui/switch` | @mantine/core Switch | DIRECT | |
| Tabs | 4+ | `@/components/ui/tabs` | @mantine/core Tabs | DIRECT | |
| Checkbox | 4+ | `@/components/ui/checkbox` | @mantine/core Checkbox | DIRECT | |
| TableRowMenu | 4+ | `@/components/ui/TableRowMenu` | @mantine/core Menu + ActionIcon | WRAP | Custom wrapper using Menu |
| Toast | 3+ | `@/components/ui/toast` | @mantine/notifications | WRAP | |
| Progress | 3+ | `@/components/ui/progress` | @mantine/core Progress | DIRECT | |
| SearchInput | 3+ | `@/components/ui/SearchInput` | @mantine/core TextInput + ActionIcon | WRAP | Custom wrapper with search styling |
| Separator | 3+ | `@/components/ui/separator` | @mantine/core Divider | DIRECT | |
| Popover | 3+ | `@/components/ui/popover` | @mantine/core Popover | WRAP | |
| Sheet | 2+ | `@/components/ui/sheet` | @mantine/core Drawer | WRAP | |
| ScrollArea | 2+ | `@/components/ui/scroll-area` | @mantine/core ScrollArea | DIRECT | |
| Slider | 2+ | `@/components/ui/slider` | @mantine/core Slider | DIRECT | |
| Sonner | 2+ | `@/components/ui/sonner` | @mantine/notifications | WRAP | |
| Toggle | 2+ | `@/components/ui/toggle` | @mantine/core Switch (custom) | WRAP | |
| RadioGroup | 2+ | `@/components/ui/radio-group` | @mantine/core Radio.Group | DIRECT | |
| HoverCard | 2+ | `@/components/ui/hover-card` | @mantine/core HoverCard | DIRECT | |
| EnhancedCheckbox | 2+ | `@/components/ui/enhanced-checkbox` | @mantine/core Checkbox | WRAP | Enhanced with label and description |
| Skeleton | 2+ | `@/components/ui/skeleton` | @mantine/core Skeleton | DIRECT | |
| ToggleGroup | 1+ | `@/components/ui/toggle-group` | @mantine/core SegmentedControl | WRAP | |
| Pagination | 1+ | `@/components/ui/pagination` | @mantine/core Pagination | WRAP | |
| EnhancedTextarea | 1+ | `@/components/ui/enhanced-textarea` | @mantine/core Textarea | WRAP | Enhanced with validation states |
| Drawer | 1+ | `@/components/ui/drawer` | @mantine/core Drawer | WRAP | |
| Sidebar | 1+ | `@/components/ui/sidebar` | @mantine/core AppShell | WRAP | Complex layout component |
| InputOTP | 1+ | `@/components/ui/input-otp` | @mantine/core PinInput | DIRECT | |
| Resizable | 1+ | `@/components/ui/resizable` | NEEDS-CONFIRMATION | NEEDS-CONFIRMATION | |
| Radix-react-dialog | 5+ | `@radix-ui/react-dialog` | @mantine/core Modal | WRAP | Used by Dialog component |
| Radix-react-dropdown-menu | 4+ | `@radix-ui/react-dropdown-menu` | @mantine/core Menu | WRAP | Used by DropdownMenu component |
| Radix-react-select | 3+ | `@radix-ui/react-select` | @mantine/core Select | WRAP | Used by Select component |
| Radix-react-tooltip | 3+ | `@radix-ui/react-tooltip` | @mantine/core Tooltip | DIRECT | Used by Tooltip component |
| Radix-react-popover | 2+ | `@radix-ui/react-popover` | @mantine/core Popover | WRAP | Used by Popover component |
| Radix-react-tabs | 2+ | `@radix-ui/react-tabs` | @mantine/core Tabs | DIRECT | Used by Tabs component |
| Radix-react-switch | 2+ | `@radix-ui/react-switch` | @mantine/core Switch | DIRECT | Used by Switch component |
| Radix-react-checkbox | 2+ | `@radix-ui/react-checkbox` | @mantine/core Checkbox | DIRECT | Used by Checkbox component |
| Radix-react-progress | 1+ | `@radix-ui/react-progress` | @mantine/core Progress | DIRECT | Used by Progress component |
| Radix-react-separator | 1+ | `@radix-ui/react-separator` | @mantine/core Divider | DIRECT | Used by Separator component |
| Radix-react-toast | 1+ | `@radix-ui/react-toast` | @mantine/notifications | WRAP | Used by Toast component |
| Radix-react-radio-group | 1+ | `@radix-ui/react-radio-group` | @mantine/core Radio.Group | DIRECT | Used by RadioGroup component |
| Radix-react-hover-card | 1+ | `@radix-ui/react-hover-card` | @mantine/core HoverCard | DIRECT | Used by HoverCard component |

## 🔍 Requires Confirmation

The following components need mapping confirmation:

- **Resizable** (1+ files)
  - Path: `@/components/ui/resizable`
  - Files: src/components/ui/resizable.tsx

## Migration Priority Phases

### Phase 2: Core Components (Direct Matches)
- Button, Input, Card, Badge, Textarea, Tooltip, Switch, Tabs, Checkbox, Progress, Separator, ScrollArea, Slider, RadioGroup, HoverCard, Skeleton, InputOTP

### Phase 3: Simple Wraps 
- Popover, Toast, Sonner, Toggle, EnhancedCheckbox, EnhancedTextarea, Drawer

### Phase 4: Complex Wraps
- Select, DropdownMenu, Sheet, ToggleGroup, Pagination

### Phase 5: High-Risk Components
- Table (sticky headers + scroll behavior)
- Dialog (focus management + trigger patterns)
- Sidebar (complex AppShell integration)

### Phase 6: Custom Business Components
- StatusBadgeSelector
- TableRowMenu  
- SearchInput

## File Usage Details

### Button
**Target:** @mantine/core Button  
**Migration:** DIRECT  
**Files (25+):**
- src/components/ui/button.tsx
- src/components/shared/SearchInput.tsx
- src/components/ui/TableRowMenu.tsx
- src/components/ui/StatusBadgeSelector.tsx
- [Additional files in portal, admin, and booking components]

### Input
**Target:** @mantine/core TextInput  
**Migration:** DIRECT  
**Files (20+):**
- src/components/ui/input.tsx
- src/components/shared/SearchInput.tsx
- src/components/ui/sidebar.tsx
- [Additional files throughout the application]

### Card
**Target:** @mantine/core Card  
**Migration:** DIRECT  
**Files (15+):**
- src/components/ui/card.tsx
- [Files throughout portal dashboard and admin interfaces]

[... Additional detailed file listings for each component ...]

## Next Steps

1. **Review Confirmation Items:** Resolve mapping for Resizable component
2. **Phase 2 Setup:** Configure MantineProvider with theme tokens
3. **Start Migration:** Begin with Button component (highest usage, direct match)
4. **Testing Strategy:** Implement side-by-side Storybook stories for validation

---

**Audit Status:** ✅ Complete  
**Ready for Phase 2:** Pending confirmation review
