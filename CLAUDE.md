# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (auto-opens browser, fallback ports if 8080 busy)
- `npm run dev:clean` - Clean start (kills existing processes, clears cache)
- `npm run dev:debug` - Development with detailed logging and debugging
- `npm run dev:port` - Prompt for custom port number
- `npm run kill:dev` - Kill all development processes
- `npm run start` - Alias for `npm run dev`
- `npm run test:dev` - Test if development server is running
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build on port 8080
- `npm run preview:clean` - Build and preview in one command
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler checks (no emit)

### Git Workflow
- **CRITICAL**: Always commit AND push changes before user testing
- User cannot see changes until they are pushed to remote main branch
- Commit with descriptive messages including the "why" behind changes
- Push immediately after committing when user needs to test functionality
- **CRITICAL**: Test big changes before proceeding to next tasks in backlog
- Stop after major fixes/features, commit & push, then wait for user testing confirmation

### VS Code Development
- Use VS Code's integrated terminal to run `npm run dev`
- Access via network URL shown in terminal (e.g., http://192.168.68.84:8080/)
- Use VS Code's "Ports" panel to forward local ports
- Chrome debugger config available in `.vscode/launch.json`

### Local Development Script
Use the development management script for easier troubleshooting:
- `./dev-server.sh start` - Start development server with proper cleanup
- `./dev-server.sh stop` - Stop all development processes
- `./dev-server.sh restart` - Clean restart of development server
- `./dev-server.sh status` - Check server status and connectivity
- `./dev-server.sh debug` - Run comprehensive environment diagnostics

### Local Development Troubleshooting
**Quick Fixes:**
1. Use `./dev-server.sh debug` to diagnose issues
2. Use `./dev-server.sh restart` for clean restart
3. Try network IP instead of localhost (shown in terminal output)

**White Screen Issues:**
1. Hard refresh browser (Cmd+Shift+R on Mac)
2. Clear browser cache and disable cache in dev tools
3. Run `npm run dev:clean` for fresh start
4. Check CSS import order in `src/index.css` (imports must come before Tailwind)

**Port Issues:**
1. Use `npm run kill:dev` to kill all processes
2. Check what's using port: `lsof -i :8080`
3. Let Vite auto-select port with `npm run dev`
4. Use `./dev-server.sh stop` for thorough cleanup

**Connection Refused:**
1. Try `npm run dev:debug` for detailed logging
2. Use network IP instead of localhost (shown in terminal)
3. Check firewall/antivirus blocking connections
4. Use `./dev-server.sh status` to verify server is responding
4. Try `npm run preview:clean` as fallback

**Performance Issues:**
1. Use `npm run dev:clean` to clear cache
2. Restart VS Code if TypeScript is slow
3. Check Activity Monitor for high CPU processes

### Testing
- Uses Vitest for testing framework
- Test files are located in `src/__tests__/`
- Tests use `.test.ts` or `.test.tsx` extensions
- Run tests with standard npm/vitest commands

### Supabase Functions
- Edge functions are in `supabase/functions/`
- Each function has its own directory with `index.ts`
- Shared utilities in `supabase/functions/_shared/`
- Functions handle webhook payloads, lead creation, and geocoding

## Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **React Router** for client-side routing with nested routes
- **TanStack Query** for server state management
- **Mantine** UI library (migrating from shadcn/ui)
- **Tailwind CSS** for styling utilities
- **Supabase** for backend services

### Routing Structure
The application uses a complex routing system defined in `src/nav-items.tsx`:
- Public routes: `/`, `/login`, `/register`, `/spanish`, `/find-classes`
- Booking flow: `/[slug]/book/*` routes for the booking process
- Portal routes: `/[slug]/portal/*` for franchisee management (nested under slug)
- Admin routes: `/admin/*` for platform administration

### Key Architectural Patterns

#### Slug-based Multi-tenancy
- Each franchisee has a unique slug (e.g., `south-denver`)
- URLs are structured as `/{franchiseeSlug}/portal/*` for portal access
- `SlugResolver` component handles franchisee resolution from URL slugs
- Protected routes ensure proper authentication and access control

#### Data Layer
- **Supabase** provides the database and edge functions
- **TanStack Query** manages all server state with hooks like:
  - `useLeads`, `useBookings`, `useClasses`, `useLocations`
  - `useFranchiseeBySlug`, `useFranchiseeProfile`
- Custom hooks encapsulate business logic and API calls
- Type-safe database schema in `src/integrations/supabase/types.ts`

#### Component Architecture
- **Mantine components** in `src/components/mantine/` (migration in progress)
- **shadcn/ui components** in `src/components/ui/` (being phased out)
- Domain-specific components organized by feature:
  - `booking/` - Booking flow components
  - `classes/` - Class management
  - `leads/` - Lead management
  - `portal/` - Franchisee portal features
  - `admin/` - Admin panel components

#### Form Handling
- Uses `react-hook-form` with `@hookform/resolvers`
- Zod schemas for form validation
- Custom hooks like `useZodForm` and `createForm` for form management
- Enhanced form components with proper error handling

### State Management
- **Global state**: TanStack Query for server data
- **Local state**: React hooks and Mantine's `useLocalStorage`
- **Form state**: React Hook Form
- **Context**: `FranchiseeContext` for franchisee-specific data

### Styling System
- **Mantine** theme in `src/mantine/theme.ts`
- **Tailwind** for layout utilities (preserved during Mantine migration)
- **CSS modules** for component-specific styles
- **Design tokens** in `src/styles/design-tokens.css`

### Webhook System
The application includes a comprehensive webhook system for external integrations:
- **Unified webhook payload** for leads and bookings
- **Event types**: `newLead` and `newBooking`
- **Edge functions** handle webhook construction and delivery
- **Real-time notifications** to external systems (n8n, etc.)

### Key Business Entities
- **Franchisees**: Multi-tenant franchisee organizations with slugs
- **Leads**: Potential customers with contact information
- **Bookings**: Confirmed class reservations with participants
- **Classes**: Scheduled programs with capacity and location
- **Locations**: Physical venues where classes are held
- **Participants**: Children enrolled in classes

### Development Notes
- Uses `@/` alias for `src/` directory imports
- Development server runs on port 8080 (both dev and preview)
- TypeScript is configured with relaxed settings (no strict null checks)
- Component tagger enabled in development mode for debugging
- Supabase client auto-generated, credentials in `src/integrations/supabase/client.ts`

#### Component Library Guidelines
- **Portal components**: Use Mantine v8 components exclusively (NOT shadcn/ui)
- **Public/booking components**: shadcn/ui components are acceptable for customer-facing areas
- **Dropdown components**: Always use `withinPortal` prop for dropdowns in tables/scrollable containers
- **Z-index hierarchy**: Sticky headers (10), dropdowns (100), modals (1000+)
- **Modal patterns**: Use custom Modal component from `@/components/mantine/Modal` for consistent behavior

#### Debugging Guidelines
- **Research existing patterns first**: Check similar components in codebase before implementing
- **Use minimal test cases**: Start with simplest working example, add complexity gradually
- **Follow established conventions**: Don't fight framework patterns, work with them
- **Modal + Dropdown issues**: Use codebase's custom Modal component and `withinPortal` prop pattern
- **Z-index problems**: Let Mantine handle layering automatically, avoid custom z-index overrides

#### Cache Management
- Aggressive cache clearing implemented on auth state changes to prevent data contamination
- Session storage cleared on user sign out/sign in to prevent cross-user data leaks
- Use `queryClient.clear()` when user changes detected