-- =============================================================================
-- Migration: 20260615000000_core_platform.sql
-- Date: 2026-06-15
-- Description: Core platform tables — ai_agents, contacts, contact_lists,
--              calls, campaigns, knowledge_base, workflows, messages,
--              analytics_daily. Triggers + RLS + Realtime.
-- Depends on: 20260608000000_workspaces_users_auth.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- APPEND-ONLY GUARD (reusable trigger function)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_immutable_table_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Append-only table. No updates or deletes permitted on %.', TG_TABLE_NAME;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- AI_AGENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  description            TEXT,
  agent_type             TEXT NOT NULL DEFAULT 'both' CHECK (agent_type IN ('inbound', 'outbound', 'both')),
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  languages              TEXT[] NOT NULL DEFAULT ARRAY['English'],
  system_prompt          TEXT,
  greeting_message       TEXT,
  script_template        TEXT,
  goal_objective         TEXT,
  success_criteria       TEXT,
  post_call_action       TEXT NOT NULL DEFAULT 'none' CHECK (post_call_action IN ('sms', 'email', 'webhook', 'none')),
  escalation_trigger     TEXT,
  transfer_number        TEXT,
  voicemail_detection    BOOLEAN NOT NULL DEFAULT false,
  business_hours         JSONB NOT NULL DEFAULT '{}',
  webhook_url            TEXT,
  custom_variables       JSONB NOT NULL DEFAULT '{}',
  fallback_message       TEXT,
  max_silence_seconds    INTEGER NOT NULL DEFAULT 10,
  max_call_duration      INTEGER NOT NULL DEFAULT 600,
  total_calls            INTEGER NOT NULL DEFAULT 0,
  avg_duration           INTEGER NOT NULL DEFAULT 0,
  success_rate           DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  last_active            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies (id) ON DELETE SET NULL;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE CASCADE;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS is_protected BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS retell_agent_id TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS retell_settings JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_ai_agents_org_id       ON public.ai_agents (org_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_workspace_id ON public.ai_agents (workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_retell_id    ON public.ai_agents (retell_agent_id);

DROP TRIGGER IF EXISTS update_ai_agents_updated_at ON public.ai_agents;
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agents_workspace_isolation" ON public.ai_agents;
CREATE POLICY "agents_workspace_isolation" ON public.ai_agents
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID AND (
      (auth.jwt() ->> 'role') IN ('org_admin', 'agency_admin')
      OR workspace_id = (auth.jwt() ->> 'workspace_id')::UUID
    )
  );

CREATE OR REPLACE FUNCTION public.prevent_protected_agent_deletion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_protected = true THEN
    RAISE EXCEPTION 'Cannot delete a protected agent (id: %).', OLD.id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_agent_delete ON public.ai_agents;
CREATE TRIGGER trg_prevent_protected_agent_delete
  BEFORE DELETE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_agent_deletion();

-- ─────────────────────────────────────────────────────────────────────────────
-- CONTACTS (replaces old "leads" table)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         UUID REFERENCES public.agencies (id) ON DELETE SET NULL,
  org_id            UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by        UUID REFERENCES auth.users (id) ON DELETE RESTRICT,
  full_name         TEXT NOT NULL,
  email             TEXT,
  phone_e164        TEXT NOT NULL,
  company           TEXT,
  country_code      CHAR(2),
  timezone          TEXT,
  status            TEXT NOT NULL DEFAULT 'Warm' CHECK (status IN ('Hot', 'Warm', 'Cold', 'Qualified', 'Lost')),
  source            TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  dnc_status        BOOLEAN NOT NULL DEFAULT false,
  last_called_at    TIMESTAMPTZ,
  last_call_outcome TEXT,
  last_contacted    TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contacts_phone_e164_format CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$'),
  CONSTRAINT contacts_country_code_format CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_contacts_org_id       ON public.contacts (org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON public.contacts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_e164   ON public.contacts (phone_e164);
CREATE INDEX IF NOT EXISTS idx_contacts_status       ON public.contacts (status);

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contacts_org_isolation" ON public.contacts;
CREATE POLICY "contacts_org_isolation" ON public.contacts
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONTACT_LISTS + CONTACT_LIST_MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_lists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID REFERENCES auth.users (id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_lists_org_id ON public.contact_lists (org_id);

ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_lists_org_isolation" ON public.contact_lists;
CREATE POLICY "contact_lists_org_isolation" ON public.contact_lists
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

CREATE TABLE IF NOT EXISTS public.contact_list_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_list_id UUID NOT NULL REFERENCES public.contact_lists (id) ON DELETE CASCADE,
  contact_id      UUID NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contact_list_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_clm_list_id    ON public.contact_list_members (contact_list_id);
CREATE INDEX IF NOT EXISTS idx_clm_contact_id ON public.contact_list_members (contact_id);

ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_list_members_via_org" ON public.contact_list_members;
CREATE POLICY "contact_list_members_via_org" ON public.contact_list_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl
      WHERE cl.id = contact_list_id
        AND cl.org_id = (auth.jwt() ->> 'org_id')::UUID
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CALLS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calls (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies (id) ON DELETE SET NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts (id) ON DELETE SET NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS direction public.call_direction NOT NULL DEFAULT 'outbound';
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS retell_call_id TEXT UNIQUE;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS twilio_call_sid TEXT UNIQUE;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS status public.call_status NOT NULL DEFAULT 'completed';
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative'));
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS transcript JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS call_cost_micro INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS currency_code CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

DO $$ BEGIN
  ALTER TABLE public.calls ADD CONSTRAINT calls_phone_e164_format CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.calls ADD CONSTRAINT calls_currency_code CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_calls_org_id       ON public.calls (org_id);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_id ON public.calls (workspace_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id     ON public.calls (agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_contact_id   ON public.calls (contact_id);
CREATE INDEX IF NOT EXISTS idx_calls_retell_id    ON public.calls (retell_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at   ON public.calls (created_at DESC);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calls_workspace_isolation" ON public.calls;
CREATE POLICY "calls_workspace_isolation" ON public.calls
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID AND (
      (auth.jwt() ->> 'role') IN ('org_admin', 'agency_admin')
      OR workspace_id = (auth.jwt() ->> 'workspace_id')::UUID
    )
  );

CREATE OR REPLACE FUNCTION public.sync_agent_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_agent_id    UUID;
  v_total_calls INTEGER;
  v_avg_dur     INTEGER;
  v_success     DECIMAL(5,2);
BEGIN
  IF TG_OP = 'DELETE' THEN v_agent_id := OLD.agent_id;
  ELSE v_agent_id := NEW.agent_id; END IF;

  IF v_agent_id IS NULL THEN RETURN NEW; END IF;

  SELECT
    COUNT(*)::INTEGER,
    COALESCE(AVG(duration), 0)::INTEGER,
    CASE WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))::NUMERIC, 2)
      ELSE 0 END
  INTO v_total_calls, v_avg_dur, v_success
  FROM public.calls WHERE agent_id = v_agent_id;

  UPDATE public.ai_agents
  SET total_calls  = v_total_calls,
      avg_duration = v_avg_dur,
      success_rate = v_success
  WHERE id = v_agent_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS sync_agent_stats_on_call ON public.calls;
CREATE TRIGGER sync_agent_stats_on_call
  AFTER INSERT OR UPDATE OR DELETE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.sync_agent_stats();

CREATE OR REPLACE FUNCTION public.auto_create_contact_from_call()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.contacts
    WHERE org_id = NEW.org_id AND phone_e164 = NEW.phone_e164
  ) THEN
    INSERT INTO public.contacts (org_id, workspace_id, created_by, full_name, phone_e164, status, source)
    VALUES (
      NEW.org_id, NEW.workspace_id, NEW.created_by,
      'New Contact (' || COALESCE(NEW.phone_e164, 'Unknown') || ')',
      COALESCE(NEW.phone_e164, '+0000000000'), 'Warm', 'AI Call'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_contact ON public.calls;
CREATE TRIGGER trg_auto_create_contact
  AFTER INSERT ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_contact_from_call();

-- ─────────────────────────────────────────────────────────────────────────────
-- CAMPAIGNS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies (id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS caller_id UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed Campaign';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status public.campaign_status NOT NULL DEFAULT 'draft';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS retry_max INTEGER NOT NULL DEFAULT 3;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS calls_per_hour INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS total_contacts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS completed_contacts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_campaigns_org_id       ON public.campaigns (org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace_id ON public.campaigns (workspace_id);

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaigns_org_isolation" ON public.campaigns;
CREATE POLICY "campaigns_org_isolation" ON public.campaigns
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

CREATE TABLE IF NOT EXISTS public.campaign_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  contact_id   UUID NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'completed', 'failed', 'skipped')),
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_call_id UUID REFERENCES public.calls (id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_cc_campaign_id ON public.campaign_contacts (campaign_id);
CREATE INDEX IF NOT EXISTS idx_cc_contact_id  ON public.campaign_contacts (contact_id);

ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign_contacts_via_org" ON public.campaign_contacts;
CREATE POLICY "campaign_contacts_via_org" ON public.campaign_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
        AND c.org_id = (auth.jwt() ->> 'org_id')::UUID
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- KNOWLEDGE_BASE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled';
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('document', 'url', 'folder', 'text'));
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('indexed', 'syncing', 'pending', 'failed'));
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS items_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_kb_org_id       ON public.knowledge_base (org_id);
CREATE INDEX IF NOT EXISTS idx_kb_workspace_id ON public.knowledge_base (workspace_id);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kb_org_isolation" ON public.knowledge_base;
CREATE POLICY "kb_org_isolation" ON public.knowledge_base
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

CREATE TABLE IF NOT EXISTS public.knowledge_base_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id        UUID NOT NULL REFERENCES public.knowledge_base (id) ON DELETE CASCADE,
  org_id       UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
  chunk_index  INTEGER NOT NULL DEFAULT 0,
  content      TEXT NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- WORKFLOWS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workflows (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed';
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS trigger_event TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS condition JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS action_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_workflows_org_id       ON public.workflows (org_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_id ON public.workflows (workspace_id);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflows_org_isolation" ON public.workflows;
CREATE POLICY "workflows_org_isolation" ON public.workflows
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id   UUID NOT NULL REFERENCES public.workflows (id) ON DELETE CASCADE,
  org_id        UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
  trigger_data  JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result        JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts (id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('sms', 'email', 'whatsapp'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS direction TEXT CHECK (direction IN ('inbound', 'outbound'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_messages_org_id     ON public.messages (org_id);
CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON public.messages (contact_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_org_isolation" ON public.messages;
CREATE POLICY "messages_org_isolation" ON public.messages
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- ANALYTICS_DAILY
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS total_calls INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS active_agents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS avg_handle_time INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS call_cost_micro INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS currency_code CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS hourly_breakdown JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.analytics_daily ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.analytics_daily ADD CONSTRAINT analytics_daily_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop unique constraint if it exists to allow redefining it later if necessary, but skip for now to avoid errors on duplicate.

CREATE INDEX IF NOT EXISTS idx_analytics_daily_org_date ON public.analytics_daily (org_id, date DESC);

ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_org_isolation" ON public.analytics_daily;
CREATE POLICY "analytics_org_isolation" ON public.analytics_daily
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPABASE REALTIME
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agents;          EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;           EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;              EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;          EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_contacts;  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;          EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_runs;      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_daily;    EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;           EXCEPTION WHEN others THEN NULL; END $$;
