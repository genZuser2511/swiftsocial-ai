-- =============================================================================
-- Migration: 20260622000000_telephony.sql
-- Date: 2026-06-22
-- Description: phone_numbers, retell_agents, twilio_webhook_logs (append-only)
-- Depends on: 20260615000000_core_platform.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- PHONE_NUMBERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS friendly_name TEXT;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'twilio';
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS provider_sid TEXT;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS is_recording_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS recording_retention_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS voicemail_greeting_url TEXT;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS ivr_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS caller_id_override TEXT;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS number_type TEXT NOT NULL DEFAULT 'local' CHECK (number_type IN ('local', 'toll-free', 'mobile', 'imported'));
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS monthly_cost_micro INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS currency_code CHAR(3) NOT NULL DEFAULT 'INR';

DO $$ BEGIN
  ALTER TABLE public.phone_numbers ADD CONSTRAINT phone_numbers_e164_format CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.phone_numbers ADD CONSTRAINT phone_numbers_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_phone_numbers_org_id   ON public.phone_numbers (org_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone    ON public.phone_numbers (phone_e164);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_agent_id ON public.phone_numbers (agent_id);

DROP TRIGGER IF EXISTS update_phone_numbers_updated_at ON public.phone_numbers;
CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phone_numbers_org_isolation" ON public.phone_numbers;
CREATE POLICY "phone_numbers_org_isolation" ON public.phone_numbers
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- RETELL_AGENTS (new — maps Retell AI agents to our ai_agents)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.retell_agents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id       UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  ai_agent_id        UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL,
  retell_agent_id    TEXT NOT NULL UNIQUE,
  retell_llm_id      TEXT,
  voice_id           TEXT NOT NULL DEFAULT '11labs-Adrian',
  language           TEXT NOT NULL DEFAULT 'en-US',
  retell_settings    JSONB NOT NULL DEFAULT '{}',
  is_active          BOOLEAN NOT NULL DEFAULT true,
  last_synced_at     TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retell_agents_org_id        ON public.retell_agents (org_id);
CREATE INDEX IF NOT EXISTS idx_retell_agents_retell_id     ON public.retell_agents (retell_agent_id);
CREATE INDEX IF NOT EXISTS idx_retell_agents_ai_agent_id   ON public.retell_agents (ai_agent_id);

DROP TRIGGER IF EXISTS update_retell_agents_updated_at ON public.retell_agents;
CREATE TRIGGER update_retell_agents_updated_at
  BEFORE UPDATE ON public.retell_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.retell_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "retell_agents_org_isolation" ON public.retell_agents;
CREATE POLICY "retell_agents_org_isolation" ON public.retell_agents
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- TWILIO_WEBHOOK_LOGS (append-only — no UPDATE or DELETE ever)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.twilio_webhook_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES public.organizations (id) ON DELETE SET NULL,
  twilio_call_sid TEXT,
  event_type      TEXT NOT NULL,
  raw_payload     JSONB NOT NULL DEFAULT '{}',
  processed       BOOLEAN NOT NULL DEFAULT false,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twilio_logs_org_id  ON public.twilio_webhook_logs (org_id);
CREATE INDEX IF NOT EXISTS idx_twilio_logs_call_sid ON public.twilio_webhook_logs (twilio_call_sid);

ALTER TABLE public.twilio_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Append-only: INSERT + SELECT only
DROP POLICY IF EXISTS "twilio_logs_insert" ON public.twilio_webhook_logs;
CREATE POLICY "twilio_logs_insert" ON public.twilio_webhook_logs
  FOR INSERT WITH CHECK (true);  -- server-side only via service role

DROP POLICY IF EXISTS "twilio_logs_select_org" ON public.twilio_webhook_logs;
CREATE POLICY "twilio_logs_select_org" ON public.twilio_webhook_logs
  FOR SELECT USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin')
  );

-- No UPDATE or DELETE policies created — append-only enforced by trigger too
DROP TRIGGER IF EXISTS trg_twilio_logs_immutable ON public.twilio_webhook_logs;
CREATE TRIGGER trg_twilio_logs_immutable
  BEFORE UPDATE OR DELETE ON public.twilio_webhook_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();
