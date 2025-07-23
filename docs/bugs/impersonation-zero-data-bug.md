# BUG REPORT: Admin Impersonation Shows Zero Data

## Issue Summary
When admin users impersonate franchisees through the User Management portal, all data (leads, bookings, classes, locations) displays as zeros/empty tables instead of the actual franchisee's business data.

## Current Status
- **Priority**: High
- **Status**: Open
- **Affects**: Admin impersonation functionality
- **Reporter**: User testing feedback
- **Date**: 2025-01-23

## Symptoms
1. Admin successfully starts impersonation session
2. Portal redirects to impersonated user's dashboard
3. All metrics show 0 (leads, bookings, classes, locations)
4. All data tables are empty
5. Console shows "useFranchiseeProfile: Starting query" but no data loads

## Expected Behavior
When impersonating a franchisee, admin should see:
- All franchisee's actual business data
- Populated leads, bookings, classes, locations tables
- Correct metrics and statistics
- Full access to franchisee's portal functionality

## Root Cause Analysis

### Database Structure (Needs Investigation)
The relationship chain should be:
```
auth.users → profiles (role)
auth.users → franchisees (via user_id)
franchisees → locations (via franchisee_id)  
franchisees → leads (via franchisee_id)
locations → classes (via location_id)
leads → bookings (via lead_id)
```

### Current Implementation Issues

#### 1. Impersonation Target Structure
**Fixed in commit 40f790c**: Updated to include both `user_id` and `franchiseeId`
```typescript
interface ImpersonationTarget {
  id: string;            // auth user ID
  franchiseeId: string;  // business franchisee ID  
  name: string;
  email: string;
  company?: string;
}
```

#### 2. Data Flow Problems
**Partially Fixed**: Updated hooks to use `getEffectiveFranchiseeId()`
- ✅ `useLeads`, `useBookings`, `useClasses`, `useLocations` updated
- ✅ `useFranchiseeProfile` updated to handle impersonation
- ❌ Still showing zero data - deeper issue exists

#### 3. Potential Remaining Issues

##### A. Database Relationship Mismatches
- **Investigation Needed**: Verify that `franchisees.user_id` correctly maps to `auth.users.id`
- **Investigation Needed**: Check if there are orphaned franchisee records
- **Investigation Needed**: Verify foreign key constraints are properly set

##### B. RLS (Row Level Security) Policies
- **Investigation Needed**: Admin impersonation might be blocked by RLS policies
- **Investigation Needed**: Policies might not recognize effective user context
- **Investigation Needed**: Cross-table joins might fail during impersonation

##### C. Query Execution Issues
- **Investigation Needed**: `getEffectiveFranchiseeId()` might return wrong ID
- **Investigation Needed**: React Query cache might not invalidate properly
- **Investigation Needed**: Async timing issues in hook execution

##### D. Data Validation Issues
- **Investigation Needed**: Target franchisee might not have actual data
- **Investigation Needed**: Data might exist but be filtered out by other conditions

## Debugging Steps Needed

### 1. Database Investigation
```sql
-- Check user to franchisee mappings
SELECT u.id as user_id, u.email, f.id as franchisee_id, f.company_name 
FROM auth.users u 
LEFT JOIN franchisees f ON u.id = f.user_id;

-- Check franchisee data counts
SELECT f.id, f.company_name,
  (SELECT COUNT(*) FROM leads WHERE franchisee_id = f.id) as lead_count,
  (SELECT COUNT(*) FROM locations WHERE franchisee_id = f.id) as location_count,
  (SELECT COUNT(*) FROM classes c JOIN locations l ON c.location_id = l.id WHERE l.franchisee_id = f.id) as class_count
FROM franchisees f;
```

### 2. Impersonation Session Testing
- Log actual impersonation session data in localStorage
- Verify `targetUser.franchiseeId` matches database records
- Test `getEffectiveFranchiseeId()` return values during impersonation

### 3. Hook Execution Tracing
- Add detailed console logs to each data hook during impersonation
- Trace query execution and result sets
- Verify React Query cache invalidation

### 4. RLS Policy Analysis
- Test direct database queries with admin user context
- Verify RLS policies allow admin access to franchisee data
- Check if impersonation context is properly recognized

## Potential Fixes

### Fix 1: Database Relationship Repair
If user-franchisee mappings are broken:
```sql
-- Fix orphaned franchisee records
UPDATE franchisees SET user_id = (SELECT id FROM auth.users WHERE email = franchisees.email) WHERE user_id IS NULL;
```

### Fix 2: RLS Policy Updates
If admin access is blocked:
```sql
-- Allow admin access to all franchisee data
ALTER POLICY ... ON leads USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
  franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid())
);
```

### Fix 3: Enhanced Impersonation Logic
If context switching fails:
```typescript
// Ensure all hooks properly respect impersonation
const useDataHook = (franchiseeId?: string) => {
  const effectiveFranchiseeId = franchiseeId || await getEffectiveFranchiseeId();
  // Force re-query when impersonation changes
  const impersonationKey = isImpersonating() ? localStorage.getItem('impersonation-session') : null;
  
  return useQuery({
    queryKey: ['data', effectiveFranchiseeId, impersonationKey],
    // ...
  });
};
```

## Next Steps
1. **PRIORITY 1**: Use Supabase MCP tools to investigate database structure and sample data
2. **PRIORITY 2**: Test impersonation flow with detailed logging
3. **PRIORITY 3**: Identify and fix root cause (likely RLS or relationship issue)
4. **PRIORITY 4**: Update all affected hooks and components
5. **PRIORITY 5**: Add comprehensive testing for impersonation scenarios

## Test Cases for Verification
Once fixed, verify:
- [ ] Admin can impersonate any franchisee
- [ ] All franchisee data displays correctly (not zeros)
- [ ] Portal navigation works during impersonation
- [ ] Exit impersonation returns to admin dashboard
- [ ] No data contamination between users
- [ ] All CRUD operations work during impersonation

## Related Code Files
- `/src/hooks/useImpersonation.ts` - Core impersonation logic
- `/src/utils/impersonationHelpers.ts` - Helper functions
- `/src/hooks/useFranchiseeProfile.ts` - Profile data fetching
- `/src/hooks/useLeads.ts`, `/src/hooks/useBookings.ts`, etc. - Data hooks
- `/src/pages/admin/UserManagement.tsx` - Impersonation trigger
- `/src/components/auth/ProtectedRoute.tsx` - Auth handling

---
*This bug should be investigated using Supabase MCP tools to examine the actual database structure and data relationships.*