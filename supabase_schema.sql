-- =========================================================
-- DHANSHRI ASSOCIATES & FINLEND PRO - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/rbgaitetaugbarzczlot/sql
-- =========================================================

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    father_spouse_name TEXT,
    dob TEXT,
    gender TEXT,
    aadhaar TEXT,
    pan TEXT,
    photo TEXT,
    kyc_status TEXT DEFAULT 'Under Review',
    addresses JSONB DEFAULT '[]'::jsonb,
    employment JSONB DEFAULT '{}'::jsonb,
    bank_account JSONB DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Finance Accounts Table
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id TEXT PRIMARY KEY,
    application_id TEXT,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_aadhaar TEXT,
    customer_pan TEXT,
    customer_photo TEXT,
    product_name TEXT,
    financed_amount NUMERIC NOT NULL,
    annual_rate_pct NUMERIC DEFAULT 0,
    monthly_rate_pct NUMERIC,
    daily_rate_rupees NUMERIC,
    tenure_months INT DEFAULT 6,
    start_date TEXT,
    status TEXT DEFAULT 'Active',
    collateral_type TEXT,
    collateral_details TEXT,
    disbursal_mode TEXT DEFAULT 'Cash',
    disbursal_ref TEXT,
    assigned_officer TEXT,
    notes TEXT,
    emi_schedule JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payments Ledger Table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
    customer_name TEXT,
    amount NUMERIC NOT NULL,
    payment_mode TEXT DEFAULT 'UPI',
    reference_no TEXT,
    installment_no INT DEFAULT 1,
    allocated_principal NUMERIC DEFAULT 0,
    allocated_interest NUMERIC DEFAULT 0,
    received_by TEXT DEFAULT 'Staff Cashier',
    receipt_no TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Loan Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    product_id TEXT,
    product_name TEXT,
    requested_amount NUMERIC NOT NULL,
    tenure_months INT DEFAULT 12,
    annual_rate_pct NUMERIC DEFAULT 14.5,
    calculated_emi NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Under Review',
    reviewer_comment TEXT,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Overdue Follow-ups Table
CREATE TABLE IF NOT EXISTS public.overdue_followups (
    id TEXT PRIMARY KEY,
    account_id TEXT,
    customer_name TEXT,
    aging_bucket TEXT,
    overdue_days INT DEFAULT 0,
    amount_due NUMERIC DEFAULT 0,
    contact_method TEXT,
    outcome TEXT,
    promise_date TEXT,
    assigned_agent TEXT,
    last_contact_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip TEXT DEFAULT '127.0.0.1'
);

-- =========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC ACCESS
-- (For publishable anon client key access)
-- =========================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overdue_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon role (Publishable Key Access)
CREATE POLICY "Allow public all on customers" ON public.customers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on finance_accounts" ON public.finance_accounts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on payments" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on applications" ON public.applications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on overdue_followups" ON public.overdue_followups FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on audit_logs" ON public.audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
