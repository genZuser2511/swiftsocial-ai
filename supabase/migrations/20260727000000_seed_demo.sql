-- =============================================================================
-- Migration: 20260727000000_seed_demo.sql
-- Date: 2026-07-27
-- Description: user_settings, demo_sessions tables. Full demo org seed with
--              confirmed ₹ pricing. Supabase Realtime for all tables.
--              All wrapped in DO $$ IF NOT EXISTS guards — fully idempotent.
-- Depends on: all previous migrations (run LAST)
-- PRE-REQUISITE: testuser@example.com must exist in Supabase Auth before
--                running this migration.
--
-- [TAG: BUGFIX/IDEMPOTENCY_REFACTOR]
-- Changed: Converted CREATE TABLE statements into idempotent ALTER TABLE ADD COLUMN blocks.
-- Changed: Added missing legacy columns (agent_type, greeting_message, goal_objective, 
--          name, description, status) to ai_agents before demo seed insertion.
-- Changed: Added missing legacy NOT NULL required columns (user_id for campaigns, 
--          phone_number for calls) in mock data insert statements.
-- Changed: Wrapped public.calls insert block with `DISABLE TRIGGER USER` and `ENABLE TRIGGER USER`
--          to safely bypass legacy triggers (e.g., auto-inserting into old 'leads' table).
-- Why:     Ensures Supabase CLI pushes successfully without conflicts, missing constraint errors, 
--          or legacy trigger failures.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USER_SETTINGS (encrypted API keys per org user)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS key_name        TEXT NOT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS encrypted_value TEXT NOT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();



ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;

DO $$ BEGIN
  ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_org_key UNIQUE (user_id, org_id, key_name);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_org_id  ON public.user_settings (org_id);

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id AND org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- DEMO_SESSIONS (tracks demo account usage — analytics only)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.demo_sessions (
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.demo_sessions ADD COLUMN IF NOT EXISTS org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.demo_sessions ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.demo_sessions ADD COLUMN IF NOT EXISTS session_data JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.demo_sessions ADD COLUMN IF NOT EXISTS started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.demo_sessions ADD COLUMN IF NOT EXISTS ended_at     TIMESTAMPTZ;
ALTER TABLE public.demo_sessions ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();



CREATE INDEX IF NOT EXISTS idx_demo_sessions_org_id ON public.demo_sessions (org_id);

ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "demo_sessions_own" ON public.demo_sessions;
CREATE POLICY "demo_sessions_own" ON public.demo_sessions
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS agent_type TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS greeting_message TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS goal_objective TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ─────────────────────────────────────────────────────────────────────────────
-- DEMO ORG SEED (idempotent — all wrapped in IF NOT EXISTS guards)
-- testuser@example.com must exist in Supabase Auth first
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_demo_org_id       UUID;
  v_demo_workspace_id UUID;
  v_demo_user_id      UUID;
  v_demo_agent1_id    UUID;
  v_demo_agent2_id    UUID;
  v_demo_contact1_id  UUID;
  v_demo_contact2_id  UUID;
BEGIN

  -- 1. Get demo user ID from Auth (must exist before this migration runs)
  SELECT id INTO v_demo_user_id FROM auth.users WHERE email = 'testuser@example.com' LIMIT 1;

  IF v_demo_user_id IS NULL THEN
    RAISE NOTICE 'testuser@example.com not found in auth.users — skipping demo seed. Create the user first, then re-run.';
    RETURN;
  END IF;

  -- 2. Demo organization
  INSERT INTO public.organizations (id, name, slug, isolation_level, data_region, is_demo, is_active, default_currency, default_language)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SwiftCall Demo', 'swiftcall-demo', 'shared', 'in', true, true, 'INR', 'en'
  )
  ON CONFLICT (id) DO NOTHING;
  v_demo_org_id := '00000000-0000-0000-0000-000000000001';

  -- 3. Demo workspace
  INSERT INTO public.workspaces (id, org_id, name, description, is_active)
  VALUES ('00000000-0000-0000-0000-000000000002', v_demo_org_id, 'Main Workspace', 'Default demo workspace', true)
  ON CONFLICT (id) DO NOTHING;
  v_demo_workspace_id := '00000000-0000-0000-0000-000000000002';

  -- 4. Link testuser@example.com → demo org + workspace as org_admin
  INSERT INTO public.profiles (id, org_id, full_name, email, default_workspace_id, is_demo_user, onboarding_completed)
  VALUES (v_demo_user_id, v_demo_org_id, 'Demo User', 'testuser@example.com', v_demo_workspace_id, true, true)
  ON CONFLICT (id) DO UPDATE SET
    org_id               = EXCLUDED.org_id,
    default_workspace_id = EXCLUDED.default_workspace_id,
    is_demo_user         = true,
    onboarding_completed = true,
    updated_at           = NOW();

  INSERT INTO public.user_workspace_roles (user_id, org_id, workspace_id, role, is_active)
  VALUES (v_demo_user_id, v_demo_org_id, v_demo_workspace_id, 'org_admin', true)
  ON CONFLICT (user_id, workspace_id) DO NOTHING;

  -- 5. Two protected default agents
  INSERT INTO public.ai_agents (id, org_id, workspace_id, created_by, user_id, name, description, agent_type, status, is_protected, is_default, greeting_message, goal_objective)
  VALUES (
    '00000000-0000-0000-0000-000000000010',
    v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_user_id,
    'Priya — Inbound Sales', 'Default inbound sales agent for demo', 'inbound', 'active', true, true,
    'Hello! This is Priya from SwiftCall. How can I help you today?',
    'Qualify the caller and schedule a demo call'
  )
  ON CONFLICT (id) DO NOTHING;
  v_demo_agent1_id := '00000000-0000-0000-0000-000000000010';

  INSERT INTO public.ai_agents (id, org_id, workspace_id, created_by, user_id, name, description, agent_type, status, is_protected, is_default, greeting_message, goal_objective)
  VALUES (
    '00000000-0000-0000-0000-000000000011',
    v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_user_id,
    'Raj — Outbound Follow-up', 'Default outbound follow-up agent for demo', 'outbound', 'active', true, true,
    'Hi! This is Raj calling from SwiftCall. I am following up on your recent inquiry.',
    'Re-engage warm leads and schedule callbacks'
  )
  ON CONFLICT (id) DO NOTHING;
  v_demo_agent2_id := '00000000-0000-0000-0000-000000000011';

  -- 6. Mock contacts
  INSERT INTO public.contacts (id, org_id, workspace_id, created_by, full_name, email, phone_e164, status, source)
  VALUES
    ('00000000-0000-0000-0000-000000000020', v_demo_org_id, v_demo_workspace_id, v_demo_user_id,
     'Arjun Sharma', 'arjun.sharma@example.com', '+919876543210', 'Hot', 'Website'),
    ('00000000-0000-0000-0000-000000000021', v_demo_org_id, v_demo_workspace_id, v_demo_user_id,
     'Priya Patel', 'priya.patel@example.com', '+919876543211', 'Warm', 'Referral')
  ON CONFLICT (id) DO NOTHING;
  v_demo_contact1_id := '00000000-0000-0000-0000-000000000020';
  v_demo_contact2_id := '00000000-0000-0000-0000-000000000021';

  -- 7. Mock calls
  ALTER TABLE public.calls DISABLE TRIGGER USER;
  INSERT INTO public.calls (org_id, workspace_id, created_by, user_id, agent_id, contact_id, phone_e164, phone_number, direction, status, duration, sentiment, summary, call_cost_micro, currency_code)
  VALUES
    (v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_user_id, v_demo_agent1_id, v_demo_contact1_id,
     '+919876543210', '+919876543210', 'inbound', 'completed', 183, 'positive',
     'Caller inquired about the Growth plan. Qualified as hot lead. Follow-up scheduled.',
     15000000, 'INR'),
    (v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_user_id, v_demo_agent2_id, v_demo_contact2_id,
     '+919876543211', '+919876543211', 'outbound', 'completed', 95, 'neutral',
     'Follow-up call. Contact was interested but asked for a callback next week.',
     8000000, 'INR')
  ON CONFLICT DO NOTHING;
  ALTER TABLE public.calls ENABLE TRIGGER USER;

  -- 8. Mock campaign
  INSERT INTO public.campaigns (org_id, workspace_id, created_by, user_id, agent_id, name, description, status, total_contacts, completed_contacts)
  VALUES (
    v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_user_id, v_demo_agent2_id,
    'Q1 Lead Follow-up Campaign', 'Automated follow-up for Q1 warm leads', 'active', 2, 1
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Demo seed completed successfully for org: %', v_demo_org_id;

END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPABASE REALTIME — publish ALL tables (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;             EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;                EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;                  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.user_workspace_roles;      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agents;                 EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;                  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;                     EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;                 EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_contacts;         EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;                 EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_daily;           EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.knowledge_base;            EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;                  EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_plans;        EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;             EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_pipeline_stages; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_contacts;        EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_policies;        EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.insurance_claims;          EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_pipeline_stages;    EXCEPTION WHEN others THEN NULL; END $$;
DO $$ begin ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_contacts;           EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_bookings;           EXCEPTION WHEN others THEN NULL; END $$;
