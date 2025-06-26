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