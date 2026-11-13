-- =============================================================================
-- Migration: 20260706000000_compliance.sql
-- Date: 2026-07-06
-- Description: dnc_list, consent_records, compliance_audit_logs, audit_logs
--              All four tables are append-only (INSERT + SELECT only).
-- Depends on: 20260615000000_core_platform.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- DNC_LIST (Do Not Call registry — append-only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dnc_list (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users (id);
ALTER TABLE public.dnc_list ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.dnc_list ADD CONSTRAINT dnc_phone_e164_format CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Skip UNIQUE constraint creation if we can't easily make it idempotent, or use DO block
DO $$ BEGIN
  ALTER TABLE public.dnc_list ADD CONSTRAINT dnc_list_org_phone_key UNIQUE (org_id, phone_e164);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_dnc_org_id    ON public.dnc_list (org_id);
CREATE INDEX IF NOT EXISTS idx_dnc_phone     ON public.dnc_list (phone_e164);

ALTER TABLE public.dnc_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dnc_org_select" ON public.dnc_list;
CREATE POLICY "dnc_org_select" ON public.dnc_list
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "dnc_org_insert" ON public.dnc_list;
CREATE POLICY "dnc_org_insert" ON public.dnc_list
  FOR INSERT WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- No UPDATE or DELETE policies. Append-only enforced by trigger.
DROP TRIGGER IF EXISTS trg_dnc_immutable ON public.dnc_list;
CREATE TRIGGER trg_dnc_immutable
  BEFORE UPDATE OR DELETE ON public.dnc_list
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();

-- ─────────────────────────────────────────────────────────────────────────────
-- CONSENT_RECORDS (append-only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts (id) ON DELETE SET NULL;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('opt-in', 'opt-out'));
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS recording_ref TEXT;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS expiry TIMESTAMPTZ;
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_consent_org_id     ON public.consent_records (org_id);
CREATE INDEX IF NOT EXISTS idx_consent_contact_id ON public.consent_records (contact_id);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_org_select" ON public.consent_records;
CREATE POLICY "consent_org_select" ON public.consent_records
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "consent_org_insert" ON public.consent_records;
CREATE POLICY "consent_org_insert" ON public.consent_records
  FOR INSERT WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP TRIGGER IF EXISTS trg_consent_immutable ON public.consent_records;
CREATE TRIGGER trg_consent_immutable
  BEFORE UPDATE OR DELETE ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPLIANCE_AUDIT_LOGS (append-only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS call_id UUID REFERENCES public.calls (id) ON DELETE SET NULL;
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('call_blocked', 'consent_granted', 'consent_revoked', 'dnc_added', 'dnc_removed', 'irdai_check_failed', 'passport_decrypted', 'gdpr_export_requested', 'data_deleted'));
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.compliance_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_compliance_org_id    ON public.compliance_audit_logs (org_id);
CREATE INDEX IF NOT EXISTS idx_compliance_call_id   ON public.compliance_audit_logs (call_id);
CREATE INDEX IF NOT EXISTS idx_compliance_event_type ON public.compliance_audit_logs (event_type);

ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compliance_logs_org_select" ON public.compliance_audit_logs;
CREATE POLICY "compliance_logs_org_select" ON public.compliance_audit_logs
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "compliance_logs_insert" ON public.compliance_audit_logs;
CREATE POLICY "compliance_logs_insert" ON public.compliance_audit_logs
  FOR INSERT WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP TRIGGER IF EXISTS trg_compliance_logs_immutable ON public.compliance_audit_logs;
CREATE TRIGGER trg_compliance_logs_immutable
  BEFORE UPDATE OR DELETE ON public.compliance_audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();

-- ─────────────────────────────────────────────────────────────────────────────
-- AUDIT_LOGS (all user actions — append-only, org_admin visible only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_id TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id      ON public.audit_logs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON public.audit_logs (action);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only org_admin can view audit logs
DROP POLICY IF EXISTS "audit_logs_org_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_org_admin_select" ON public.audit_logs
  FOR SELECT USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') = 'org_admin'
  );

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);  -- server-side only

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();
