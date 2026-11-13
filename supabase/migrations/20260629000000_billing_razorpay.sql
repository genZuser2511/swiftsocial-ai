-- =============================================================================
-- Migration: 20260629000000_billing_razorpay.sql
-- Date: 2026-06-29
-- Description: subscription_plans (seeded with confirmed ₹ pricing),
--              subscriptions, seat_assignments, usage_records, invoices,
--              razorpay_webhook_logs (append-only).
-- Depends on: 20260615000000_core_platform.sql
-- ACTION AFTER PUSH:
--   Create Free/Starter/Growth plans in Razorpay dashboard →
--   UPDATE subscription_plans SET razorpay_plan_id = '...' WHERE name = '...'
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SUBSCRIPTION_PLANS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL UNIQUE,
  tier                     public.plan_tier NOT NULL,
  price_monthly_micro      BIGINT NOT NULL DEFAULT 0,   -- e.g. 9999000000 = ₹9,999
  price_annual_micro       BIGINT NOT NULL DEFAULT 0,
  currency_code            CHAR(3) NOT NULL DEFAULT 'INR',
  max_agents               INTEGER,                      -- NULL = unlimited
  max_workspaces           INTEGER,
  max_seats                INTEGER,
  minutes_included         INTEGER NOT NULL DEFAULT 0,
  extra_minute_price_micro BIGINT NOT NULL DEFAULT 0,
  features                 JSONB NOT NULL DEFAULT '{}',  -- feature flags
  razorpay_plan_id         TEXT,                         -- fill after creating in Razorpay dashboard
  is_active                BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT plans_currency CHECK (currency_code ~ '^[A-Z]{3}$')
);

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed confirmed ₹ pricing (idempotent)
INSERT INTO public.subscription_plans
  (name, tier, price_monthly_micro, price_annual_micro, currency_code, max_agents, max_workspaces, max_seats, minutes_included, features)
VALUES
  (
    'Free', 'free', 0, 0, 'INR', 1, 1, 1, 0,
    '{"analytics":"basic","support":"community","custom_greetings":false,"ivr_builder":false,"audit_logs":false,"api_access":false}'::JSONB
  ),
  (
    'Starter', 'starter', 9999000000, 95990000000, 'INR', 5, 3, 10, 500,
    '{"analytics":"advanced","support":"email","custom_greetings":true,"ivr_builder":false,"audit_logs":false,"api_access":false}'::JSONB
  ),
  (
    'Growth', 'growth', 24999000000, 239990000000, 'INR', NULL, NULL, NULL, 2000,
    '{"analytics":"advanced","support":"priority","custom_greetings":true,"ivr_builder":true,"audit_logs":true,"api_access":true}'::JSONB
  ),
  (
    'Enterprise', 'enterprise', 0, 0, 'INR', NULL, NULL, NULL, 0,
    '{"analytics":"advanced","support":"dedicated_am_sla","custom_greetings":true,"ivr_builder":true,"audit_logs":true,"api_access":true,"white_label":true,"on_premise":true}'::JSONB
  )
ON CONFLICT (name) DO UPDATE SET
  price_monthly_micro = EXCLUDED.price_monthly_micro,
  price_annual_micro  = EXCLUDED.price_annual_micro,
  features            = EXCLUDED.features,
  updated_at          = NOW();

-- No RLS on subscription_plans — public read
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans_public_read" ON public.subscription_plans;
CREATE POLICY "plans_public_read" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                    UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  plan_id                   UUID NOT NULL REFERENCES public.subscription_plans (id),
  status                    public.sub_status NOT NULL DEFAULT 'trialing',
  billing_cycle             public.billing_cycle NOT NULL DEFAULT 'monthly',
  razorpay_subscription_id  TEXT UNIQUE,
  razorpay_customer_id      TEXT,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  trial_ends_at             TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  cancelled_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id)  -- one active subscription per org
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id        ON public.subscriptions (org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id   ON public.subscriptions (razorpay_subscription_id);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_org_admin_view" ON public.subscriptions;
CREATE POLICY "subscriptions_org_admin_view" ON public.subscriptions
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "subscriptions_org_admin_manage" ON public.subscriptions;
CREATE POLICY "subscriptions_org_admin_manage" ON public.subscriptions
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin', 'billing_only')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SEAT_ASSIGNMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seat_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions (id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscription_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_seat_assignments_org_id ON public.seat_assignments (org_id);

ALTER TABLE public.seat_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seat_assignments_org_admin" ON public.seat_assignments;
CREATE POLICY "seat_assignments_org_admin" ON public.seat_assignments
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin', 'billing_only')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- USAGE_RECORDS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  subscription_id   UUID REFERENCES public.subscriptions (id) ON DELETE SET NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  minutes_used      INTEGER NOT NULL DEFAULT 0,
  calls_made        INTEGER NOT NULL DEFAULT 0,
  agents_active     INTEGER NOT NULL DEFAULT 0,
  overage_micro     BIGINT NOT NULL DEFAULT 0,
  currency_code     CHAR(3) NOT NULL DEFAULT 'INR',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT usage_currency CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_usage_records_org_id ON public.usage_records (org_id, period_start DESC);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_records_org_view" ON public.usage_records;
CREATE POLICY "usage_records_org_view" ON public.usage_records
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions (id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_micro BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency_code CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded'));
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS razorpay_invoice_id TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.invoices ADD CONSTRAINT invoices_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_org_id      ON public.invoices (org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_razorpay_id ON public.invoices (razorpay_payment_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_org_view" ON public.invoices;
CREATE POLICY "invoices_org_view" ON public.invoices
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "invoices_billing_insert" ON public.invoices;
CREATE POLICY "invoices_billing_insert" ON public.invoices
  FOR INSERT WITH CHECK (true);  -- server-side webhook handler only

-- ─────────────────────────────────────────────────────────────────────────────
-- RAZORPAY_WEBHOOK_LOGS (append-only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.razorpay_webhook_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id TEXT NOT NULL UNIQUE,              -- idempotency key
  event_type        TEXT NOT NULL,
  org_id            UUID REFERENCES public.organizations (id) ON DELETE SET NULL,
  raw_payload       JSONB NOT NULL DEFAULT '{}',
  processed         BOOLEAN NOT NULL DEFAULT false,
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_razorpay_logs_event_id ON public.razorpay_webhook_logs (razorpay_event_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_logs_org_id   ON public.razorpay_webhook_logs (org_id);

ALTER TABLE public.razorpay_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Append-only: server inserts only, org_admin can view
DROP POLICY IF EXISTS "razorpay_logs_insert" ON public.razorpay_webhook_logs;
CREATE POLICY "razorpay_logs_insert" ON public.razorpay_webhook_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "razorpay_logs_org_view" ON public.razorpay_webhook_logs;
CREATE POLICY "razorpay_logs_org_view" ON public.razorpay_webhook_logs
  FOR SELECT USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin', 'billing_only')
  );

DROP TRIGGER IF EXISTS trg_razorpay_logs_immutable ON public.razorpay_webhook_logs;
CREATE TRIGGER trg_razorpay_logs_immutable
  BEFORE UPDATE OR DELETE ON public.razorpay_webhook_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();
