-- Create transactions table for payment tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisee_id UUID NOT NULL REFERENCES public.franchisees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  type VARCHAR(20) NOT NULL DEFAULT 'payment', -- payment, refund, adjustment
  
  -- External payment provider info
  stripe_payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Transaction metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Billing details
  billing_email VARCHAR(255),
  billing_name VARCHAR(255),
  billing_address JSONB,
  
  -- Timestamps
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_franchisee_id ON public.transactions(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent_id ON public.transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_processed_at ON public.transactions(processed_at);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for franchisees to view their own transactions
CREATE POLICY "Franchisees can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Policy for admin users to view all transactions
CREATE POLICY "Admin users can view all transactions"
  ON public.transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admin users to insert transactions
CREATE POLICY "Admin users can insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admin users to update transactions
CREATE POLICY "Admin users can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for system to insert transactions (for webhooks)
CREATE POLICY "System can insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (true);

-- Add trigger to update updated_at column
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
INSERT INTO public.transactions (
  franchisee_id,
  user_id,
  amount,
  status,
  type,
  description,
  stripe_payment_intent_id,
  billing_email,
  billing_name,
  processed_at
) VALUES 
-- Get some existing franchisees for sample data
(
  (SELECT id FROM public.franchisees LIMIT 1),
  (SELECT user_id FROM public.franchisees LIMIT 1),
  29.99,
  'succeeded',
  'payment',
  'Monthly subscription - Plus plan',
  'pi_1234567890abcdef',
  (SELECT email FROM public.franchisees LIMIT 1),
  (SELECT contact_name FROM public.franchisees LIMIT 1),
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM public.franchisees LIMIT 1 OFFSET 1),
  (SELECT user_id FROM public.franchisees LIMIT 1 OFFSET 1),
  79.99,
  'succeeded', 
  'payment',
  'Monthly subscription - Pro plan',
  'pi_0987654321fedcba',
  (SELECT email FROM public.franchisees LIMIT 1 OFFSET 1),
  (SELECT contact_name FROM public.franchisees LIMIT 1 OFFSET 1),
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM public.franchisees LIMIT 1),
  (SELECT user_id FROM public.franchisees LIMIT 1),
  -29.99,
  'succeeded',
  'refund',
  'Refund for duplicate charge',
  'pi_1234567890abcdef',
  (SELECT email FROM public.franchisees LIMIT 1),
  (SELECT contact_name FROM public.franchisees LIMIT 1),
  NOW() - INTERVAL '3 days'
);