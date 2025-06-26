# URGENT: Manual Database Migration Required

## Issue
The "Update Booking" feature is failing due to missing Row Level Security (RLS) policies on the `bookings` table.

## Solution
A new migration file has been created: `supabase/migrations/20250626101945_add_bookings_rls_policies.sql`

## Manual Steps Required

### 1. Open Supabase Dashboard
- Go to your project's Supabase dashboard
- Navigate to **SQL Editor**

### 2. Execute Migration
Copy and paste the contents of `supabase/migrations/20250626101945_add_bookings_rls_policies.sql` into the SQL Editor and run it.

**Or manually run this SQL:**

```sql
-- Enable Row Level Security on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view bookings for their franchisee
CREATE POLICY "Users can view bookings for their franchisee" 
  ON public.bookings 
  FOR SELECT 
  USING (
    lead_id IN (
      SELECT id FROM public.leads 
      WHERE franchisee_id IN (
        SELECT id FROM public.franchisees 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for users to update bookings for their franchisee
CREATE POLICY "Users can update bookings for their franchisee"
  ON public.bookings
  FOR UPDATE
  USING (
    lead_id IN (
      SELECT id FROM public.leads 
      WHERE franchisee_id IN (
        SELECT id FROM public.franchisees 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for users to insert bookings for their franchisee
CREATE POLICY "Users can insert bookings for their franchisee"
  ON public.bookings
  FOR INSERT
  WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads 
      WHERE franchisee_id IN (
        SELECT id FROM public.franchisees 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for users to delete bookings for their franchisee
CREATE POLICY "Users can delete bookings for their franchisee"
  ON public.bookings
  FOR DELETE
  USING (
    lead_id IN (
      SELECT id FROM public.leads 
      WHERE franchisee_id IN (
        SELECT id FROM public.franchisees 
        WHERE user_id = auth.uid()
      )
    )
  );
```

### 3. Test the Fix
After running the migration, test the "Update Booking" feature in the EditBookingModal.

### 4. Cleanup
Once confirmed working, delete this file: `MANUAL_MIGRATION_REQUIRED.md`

## Expected Result
- Users should be able to update bookings for their franchisee
- No more "No rows were updated" errors
- Booking updates should work normally