
-- Phase 1: Add sender_name and business_email columns to franchisees table
ALTER TABLE public.franchisees
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS business_email text;

-- Back-fill sender_name with company_name where null
UPDATE public.franchisees 
SET sender_name = company_name 
WHERE sender_name IS NULL;
