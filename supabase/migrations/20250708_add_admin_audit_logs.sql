-- Create admin audit logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_resource_type TEXT,
  target_resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_user_id ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to view all audit logs
CREATE POLICY "Admin users can view all audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admin users to insert audit logs
CREATE POLICY "Admin users can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at column
CREATE TRIGGER update_admin_audit_logs_updated_at
  BEFORE UPDATE ON public.admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();