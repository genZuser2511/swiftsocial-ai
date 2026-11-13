-- =============================================================================
-- Migration: 20260601000000_extensions_enums.sql
-- Date: 2026-06-01
-- Description: Extensions, all ENUMs, and utility functions
-- Depends on: nothing (run FIRST always)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMs (idempotent — check before create)
-- ─────────────────────────────────────────────────────────────────────────────

-- User roles within a workspace
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'org_admin',
    'workspace_admin',
    'manager',
    'agent',
    'viewer',
    'billing_only',
    'agency_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tenant isolation level
DO $$ BEGIN
  CREATE TYPE public.isolation_level AS ENUM (
    'shared',
    'dedicated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Call status
DO $$ BEGIN
  CREATE TYPE public.call_status AS ENUM (
    'completed',
    'transferred',
    'failed',
    'missed',
    'ongoing',
    'no_answer',
    'busy',
    'voicemail'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Call direction
DO $$ BEGIN
  CREATE TYPE public.call_direction AS ENUM (
    'inbound',
    'outbound'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Campaign status
DO $$ BEGIN
  CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'scheduled',
    'active',
    'paused',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Subscription plan tier
DO $$ BEGIN
  CREATE TYPE public.plan_tier AS ENUM (
    'free',
    'starter',
    'growth',
    'enterprise'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Invitation status
DO $$ BEGIN
  CREATE TYPE public.invite_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Billing cycle
DO $$ BEGIN
  CREATE TYPE public.billing_cycle AS ENUM (
    'monthly',
    'annual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Subscription status
DO $$ BEGIN
  CREATE TYPE public.sub_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'cancelled',
    'paused',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- UTILITY FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Validate E.164 phone number format (+[country_code][number])
CREATE OR REPLACE FUNCTION public.validate_e164_phone(phone TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  RETURN phone ~ '^\+[1-9]\d{7,14}$';
END;
$$;

-- Validate ISO 4217 currency code (3 uppercase letters)
CREATE OR REPLACE FUNCTION public.validate_iso_currency(code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  RETURN code ~ '^[A-Z]{3}$';
END;
$$;

-- Validate ISO 3166-1 alpha-2 country code (2 uppercase letters)
CREATE OR REPLACE FUNCTION public.validate_iso_country(code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  RETURN code ~ '^[A-Z]{2}$';
END;
$$;
-- =============================================================================
-- Migration: 20260601000001_agencies_organizations.sql
-- Date: 2026-06-01
-- Description: agencies + organizations tables with full constraints and RLS
-- Depends on: 20260601000000_extensions_enums.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- AGENCIES TABLE (White-label future — schema only, no rows in Phase 1)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agencies (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                            TEXT NOT NULL,
  slug                            TEXT NOT NULL,
  subdomain                       TEXT,
  custom_domain                   TEXT,
  custom_domain_verified          BOOLEAN NOT NULL DEFAULT false,
  custom_domain_verification_token TEXT,
  branding_settings               JSONB NOT NULL DEFAULT '{}',
  razorpay_customer_id            TEXT,
  is_active                       BOOLEAN NOT NULL DEFAULT true,
  is_demo                         BOOLEAN NOT NULL DEFAULT false,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT agencies_slug_unique      UNIQUE (slug),
  CONSTRAINT agencies_subdomain_unique UNIQUE (subdomain),
  CONSTRAINT agencies_custom_domain_unique UNIQUE (custom_domain)
);

CREATE INDEX IF NOT EXISTS idx_agencies_slug         ON public.agencies (slug);
CREATE INDEX IF NOT EXISTS idx_agencies_subdomain    ON public.agencies (subdomain);
CREATE INDEX IF NOT EXISTS idx_agencies_custom_domain ON public.agencies (custom_domain);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_agencies_updated_at ON public.agencies;
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Agency admins see only their own agency (future use)
DROP POLICY IF EXISTS "agency_admin_sees_own_agency" ON public.agencies;
CREATE POLICY "agency_admin_sees_own_agency" ON public.agencies
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'agency_admin'
    AND id = (auth.jwt() ->> 'agency_id')::UUID
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- ORGANIZATIONS TABLE (primary billing unit — Razorpay customer)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id           UUID REFERENCES public.agencies (id) ON DELETE SET NULL, -- nullable: Phase 1 no agency
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL,
  isolation_level     public.isolation_level NOT NULL DEFAULT 'shared',
  data_region         CHAR(2) NOT NULL DEFAULT 'in',
  compliance_flags    TEXT[] NOT NULL DEFAULT '{}',
  is_demo             BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  subdomain           TEXT,
  custom_domain       TEXT,
  branding_settings   JSONB NOT NULL DEFAULT '{}',
  razorpay_customer_id TEXT,
  default_currency    CHAR(3) NOT NULL DEFAULT 'INR',
  default_language    TEXT NOT NULL DEFAULT 'en',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT orgs_slug_unique   UNIQUE (slug),
  CONSTRAINT orgs_data_region   CHECK (data_region IN ('in', 'us', 'eu', 'ap', 'me')),
  CONSTRAINT orgs_currency      CHECK (default_currency ~ '^[A-Z]{3}$'),
  CONSTRAINT orgs_custom_domain_unique UNIQUE (custom_domain)
);

CREATE INDEX IF NOT EXISTS idx_orgs_slug          ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS idx_orgs_subdomain     ON public.organizations (subdomain);
CREATE INDEX IF NOT EXISTS idx_orgs_custom_domain ON public.organizations (custom_domain);
CREATE INDEX IF NOT EXISTS idx_orgs_agency_id     ON public.organizations (agency_id);
CREATE INDEX IF NOT EXISTS idx_orgs_is_demo       ON public.organizations (is_demo);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- data_region IMMUTABILITY TRIGGER
-- Once an org is created, data_region can never change
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_data_region_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.data_region IS DISTINCT FROM NEW.data_region THEN
    RAISE EXCEPTION 'data_region is immutable after organization creation.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_data_region ON public.organizations;
CREATE TRIGGER trg_immutable_data_region
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.prevent_data_region_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — ORGANIZATIONS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Org members see their own org
DROP POLICY IF EXISTS "org_members_see_own_org" ON public.organizations;
CREATE POLICY "org_members_see_own_org" ON public.organizations
  FOR SELECT USING (
    id = (auth.jwt() ->> 'org_id')::UUID
  );

-- Agency admins see all orgs under their agency (future)
DROP POLICY IF EXISTS "agency_admin_sees_own_orgs" ON public.organizations;
CREATE POLICY "agency_admin_sees_own_orgs" ON public.organizations
  FOR SELECT USING (
    agency_id = (auth.jwt() ->> 'agency_id')::UUID
    AND (auth.jwt() ->> 'role') = 'agency_admin'
  );

-- Org admins can update their own org settings
DROP POLICY IF EXISTS "org_admin_can_update_own_org" ON public.organizations;
CREATE POLICY "org_admin_can_update_own_org" ON public.organizations
  FOR UPDATE USING (
    id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') = 'org_admin'
  );
-- =============================================================================
-- Migration: 20260608000000_workspaces_users_auth.sql
-- Date: 2026-06-08
-- Description: Workspaces, teams, profiles, user_workspace_roles, invitations,
--              on_auth_user_created trigger, JWT custom claims hook
-- Depends on: 20260601000001_agencies_organizations.sql
-- MANUAL STEP AFTER PUSH:
--   Supabase Dashboard → Auth → Hooks → Custom Access Token
--   → Select function: auth.custom_access_token_hook
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- WORKSPACES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_org_id ON public.workspaces (org_id);

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_members_see_own_workspace" ON public.workspaces;
CREATE POLICY "workspace_members_see_own_workspace" ON public.workspaces
  FOR SELECT USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (
      (auth.jwt() ->> 'role') IN ('org_admin', 'agency_admin')
      OR id = (auth.jwt() ->> 'workspace_id')::UUID
    )
  );

DROP POLICY IF EXISTS "org_admin_manage_workspaces" ON public.workspaces;
CREATE POLICY "org_admin_manage_workspaces" ON public.workspaces
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') = 'org_admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- TEAMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_org_id       ON public.teams (org_id);
CREATE INDEX IF NOT EXISTS idx_teams_workspace_id ON public.teams (workspace_id);

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_members_see_own_team" ON public.teams;
CREATE POLICY "team_members_see_own_team" ON public.teams
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "org_admin_manage_teams" ON public.teams;
CREATE POLICY "org_admin_manage_teams" ON public.teams
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin', 'workspace_admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users — id = auth.users.id)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  org_id                UUID REFERENCES public.organizations (id) ON DELETE SET NULL,
  agency_id             UUID REFERENCES public.agencies (id) ON DELETE SET NULL,     -- nullable
  full_name             TEXT,
  email                 TEXT UNIQUE,
  phone_e164            TEXT,
  avatar_url            TEXT,
  is_demo_user          BOOLEAN NOT NULL DEFAULT false,
  default_workspace_id  UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  preferred_language    TEXT NOT NULL DEFAULT 'en',
  country_code          CHAR(2),
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_phone_e164_format CHECK (
    phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$'
  ),
  CONSTRAINT profiles_country_code_format CHECK (
    country_code IS NULL OR country_code ~ '^[A-Z]{2}$'
  )
);

CREATE INDEX IF NOT EXISTS idx_profiles_org_id    ON public.profiles (org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles (agency_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email     ON public.profiles (email);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
CREATE POLICY "users_view_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Org admins can view all profiles in their org
DROP POLICY IF EXISTS "org_admin_view_org_profiles" ON public.profiles;
CREATE POLICY "org_admin_view_org_profiles" ON public.profiles
  FOR SELECT USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin', 'workspace_admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- USER_WORKSPACE_ROLES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_workspace_roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  team_id      UUID REFERENCES public.teams (id) ON DELETE SET NULL,              -- nullable
  role         public.user_role NOT NULL DEFAULT 'agent',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_workspace_roles_unique UNIQUE (user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_uwr_user_id      ON public.user_workspace_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_uwr_org_id       ON public.user_workspace_roles (org_id);
CREATE INDEX IF NOT EXISTS idx_uwr_workspace_id ON public.user_workspace_roles (workspace_id);

DROP TRIGGER IF EXISTS update_uwr_updated_at ON public.user_workspace_roles;
CREATE TRIGGER update_uwr_updated_at
  BEFORE UPDATE ON public.user_workspace_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_workspace_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_see_own_roles" ON public.user_workspace_roles;
CREATE POLICY "users_see_own_roles" ON public.user_workspace_roles
  FOR SELECT USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (
      user_id = auth.uid()
      OR (auth.jwt() ->> 'role') IN ('org_admin', 'workspace_admin')
    )
  );

DROP POLICY IF EXISTS "org_admin_manage_roles" ON public.user_workspace_roles;
CREATE POLICY "org_admin_manage_roles" ON public.user_workspace_roles
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') = 'org_admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  invited_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         public.user_role NOT NULL DEFAULT 'agent',
  token        TEXT NOT NULL,
  status       public.invite_status NOT NULL DEFAULT 'pending',
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT invitations_token_unique UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_invitations_org_id       ON public.invitations (org_id);
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id ON public.invitations (workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email        ON public.invitations (email);
CREATE INDEX IF NOT EXISTS idx_invitations_token        ON public.invitations (token);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_admin_manage_invitations" ON public.invitations;
CREATE POLICY "org_admin_manage_invitations" ON public.invitations
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('org_admin', 'workspace_admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- JWT CUSTOM CLAIMS HOOK
-- Injects org_id, agency_id, workspace_id, role, is_demo into every JWT
-- MANUAL STEP: Register in Supabase Dashboard → Auth → Hooks
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_profile   RECORD;
  v_role      TEXT;
BEGIN
  -- Fetch org/workspace/agency/demo context for this user
  SELECT
    p.org_id,
    p.agency_id,
    p.default_workspace_id AS workspace_id,
    p.is_demo_user,
    o.is_demo,
    o.isolation_level,
    o.data_region
  INTO v_profile
  FROM public.profiles p
  LEFT JOIN public.organizations o ON o.id = p.org_id
  WHERE p.id = (event ->> 'user_id')::UUID;

  -- Fetch primary role (earliest active assignment)
  SELECT role::TEXT INTO v_role
  FROM public.user_workspace_roles
  WHERE user_id = (event ->> 'user_id')::UUID
    AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1;

  -- Inject claims into the JWT
  event := jsonb_set(event, '{claims,org_id}',
    to_jsonb(COALESCE(v_profile.org_id::TEXT, '')));
  event := jsonb_set(event, '{claims,agency_id}',
    to_jsonb(COALESCE(v_profile.agency_id::TEXT, '')));
  event := jsonb_set(event, '{claims,workspace_id}',
    to_jsonb(COALESCE(v_profile.workspace_id::TEXT, '')));
  event := jsonb_set(event, '{claims,role}',
    to_jsonb(COALESCE(v_role, 'agent')));
  event := jsonb_set(event, '{claims,is_demo}',
    to_jsonb(COALESCE(v_profile.is_demo, false)));

  RETURN event;
END;
$$;
-- =============================================================================
-- Migration: 20260615000000_core_platform.sql
-- Date: 2026-06-15
-- Description: Core platform tables — ai_agents, contacts, contact_lists,
--              calls, campaigns, knowledge_base, workflows, messages,
--              analytics_daily. Triggers + RLS + Realtime.
-- Depends on: 20260608000000_workspaces_users_auth.sql
-- NOTE: This is the largest migration file.
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
  -- Tenant columns (universal rule)
  agency_id              UUID REFERENCES public.agencies (id) ON DELETE SET NULL,
  org_id                 UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  created_by             UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  -- Agent identity
  name                   TEXT NOT NULL,
  description            TEXT,
  agent_type             TEXT NOT NULL DEFAULT 'both' CHECK (agent_type IN ('inbound', 'outbound', 'both')),
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  is_protected           BOOLEAN NOT NULL DEFAULT false,   -- protected agents cannot be deleted
  is_default             BOOLEAN NOT NULL DEFAULT false,
  -- Retell AI integration
  retell_agent_id        TEXT,
  retell_settings        JSONB NOT NULL DEFAULT '{}',
  -- Agent behaviour
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
  -- Stats (auto-updated by trigger)
  total_calls            INTEGER NOT NULL DEFAULT 0,
  avg_duration           INTEGER NOT NULL DEFAULT 0,
  success_rate           DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  last_active            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- ─────────────────────────────────────────────────────────────────────────────
-- PREVENT PROTECTED AGENT DELETION TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────
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
  org_id            UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by        UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  -- Contact info
  full_name         TEXT NOT NULL,
  email             TEXT,
  phone_e164        TEXT NOT NULL,
  company           TEXT,
  country_code      CHAR(2),
  timezone          TEXT,
  -- CRM fields
  status            TEXT NOT NULL DEFAULT 'Warm' CHECK (status IN ('Hot', 'Warm', 'Cold', 'Qualified', 'Lost')),
  source            TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  dnc_status        BOOLEAN NOT NULL DEFAULT false,
  -- Call tracking
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
-- CONTACT_LISTS + CONTACT_LIST_MEMBERS (new — did not exist before)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_lists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_lists_org_id ON public.contact_lists (org_id);

DROP TRIGGER IF EXISTS update_contact_lists_updated_at ON public.contact_lists;
CREATE TRIGGER update_contact_lists_updated_at
  BEFORE UPDATE ON public.contact_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  agency_id         UUID REFERENCES public.agencies (id) ON DELETE SET NULL,
  org_id            UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by        UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  -- Relations
  agent_id          UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL,
  contact_id        UUID REFERENCES public.contacts (id) ON DELETE SET NULL,
  -- Telephony
  phone_e164        TEXT NOT NULL,
  direction         public.call_direction NOT NULL DEFAULT 'outbound',
  retell_call_id    TEXT UNIQUE,
  twilio_call_sid   TEXT UNIQUE,
  -- Call data
  status            public.call_status NOT NULL DEFAULT 'completed',
  duration          INTEGER NOT NULL DEFAULT 0,              -- seconds
  sentiment         TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  summary           TEXT,
  recording_url     TEXT,
  transcript        JSONB NOT NULL DEFAULT '{}',
  -- Cost (microcurrency: value × 1,000,000)
  call_cost_micro   INTEGER NOT NULL DEFAULT 0,
  currency_code     CHAR(3) NOT NULL DEFAULT 'INR',
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT calls_phone_e164_format CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$'),
  CONSTRAINT calls_currency_code     CHECK (currency_code ~ '^[A-Z]{3}$')
);

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

-- ─────────────────────────────────────────────────────────────────────────────
-- SYNC AGENT STATS TRIGGER (auto-updates ai_agents stats on call change)
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE CONTACT FROM CALL TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────
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
      'New Contact (' || NEW.phone_e164 || ')',
      NEW.phone_e164, 'Warm', 'AI Call'
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
-- CAMPAIGNS + CAMPAIGN_CONTACTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        UUID REFERENCES public.agencies (id) ON DELETE SET NULL,
  org_id           UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id     UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by       UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  agent_id         UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL,
  caller_id        UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL,    -- phone number source agent
  name             TEXT NOT NULL,
  description      TEXT,
  status           public.campaign_status NOT NULL DEFAULT 'draft',
  start_at         TIMESTAMPTZ,
  end_at           TIMESTAMPTZ,
  timezone         TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  retry_max        INTEGER NOT NULL DEFAULT 3,
  calls_per_hour   INTEGER NOT NULL DEFAULT 30,
  total_contacts   INTEGER NOT NULL DEFAULT 0,
  completed_contacts INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

DROP TRIGGER IF EXISTS update_campaign_contacts_updated_at ON public.campaign_contacts;
CREATE TRIGGER update_campaign_contacts_updated_at
  BEFORE UPDATE ON public.campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
-- KNOWLEDGE_BASE + CHUNKS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  title        TEXT NOT NULL,
  type         TEXT CHECK (type IN ('document', 'url', 'folder', 'text')),
  file_size    BIGINT,
  file_url     TEXT,
  content      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('indexed', 'syncing', 'pending', 'failed')),
  items_count  INTEGER NOT NULL DEFAULT 0,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_org_id       ON public.knowledge_base (org_id);
CREATE INDEX IF NOT EXISTS idx_kb_workspace_id ON public.knowledge_base (workspace_id);

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kb_org_isolation" ON public.knowledge_base;
CREATE POLICY "kb_org_isolation" ON public.knowledge_base
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- Knowledge base chunks (for pgvector embeddings — future)
CREATE TABLE IF NOT EXISTS public.knowledge_base_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id        UUID NOT NULL REFERENCES public.knowledge_base (id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  chunk_index  INTEGER NOT NULL DEFAULT 0,
  content      TEXT NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kbc_kb_id  ON public.knowledge_base_chunks (kb_id);
CREATE INDEX IF NOT EXISTS idx_kbc_org_id ON public.knowledge_base_chunks (org_id);

ALTER TABLE public.knowledge_base_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kbc_org_isolation" ON public.knowledge_base_chunks;
CREATE POLICY "kbc_org_isolation" ON public.knowledge_base_chunks
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- WORKFLOWS + WORKFLOW_RUNS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workflows (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by     UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  name           TEXT NOT NULL,
  trigger_event  TEXT NOT NULL,
  condition      JSONB NOT NULL DEFAULT '{}',
  action_type    TEXT NOT NULL,
  action_config  JSONB NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_org_id       ON public.workflows (org_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_id ON public.workflows (workspace_id);

DROP TRIGGER IF EXISTS update_workflows_updated_at ON public.workflows;
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflows_org_isolation" ON public.workflows;
CREATE POLICY "workflows_org_isolation" ON public.workflows
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id   UUID NOT NULL REFERENCES public.workflows (id) ON DELETE CASCADE,
  org_id        UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  trigger_data  JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result        JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON public.workflow_runs (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_org_id      ON public.workflow_runs (org_id);

ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_runs_org_isolation" ON public.workflow_runs;
CREATE POLICY "workflow_runs_org_isolation" ON public.workflow_runs
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  contact_id   UUID REFERENCES public.contacts (id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  type         TEXT CHECK (type IN ('sms', 'email', 'whatsapp')),
  direction    TEXT CHECK (direction IN ('inbound', 'outbound')),
  status       TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  date              DATE NOT NULL,
  total_calls       INTEGER NOT NULL DEFAULT 0,
  active_agents     INTEGER NOT NULL DEFAULT 0,
  avg_handle_time   INTEGER NOT NULL DEFAULT 0,
  call_cost_micro   INTEGER NOT NULL DEFAULT 0,
  currency_code     CHAR(3) NOT NULL DEFAULT 'INR',
  success_rate      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  hourly_breakdown  JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT analytics_daily_currency CHECK (currency_code ~ '^[A-Z]{3}$'),
  UNIQUE (org_id, workspace_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_org_date ON public.analytics_daily (org_id, date DESC);

ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_org_isolation" ON public.analytics_daily;
CREATE POLICY "analytics_org_isolation" ON public.analytics_daily
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPABASE REALTIME (safe to re-run — exceptions swallowed)
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
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id             UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by               UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  phone_e164               TEXT NOT NULL,
  friendly_name            TEXT,
  provider                 TEXT NOT NULL DEFAULT 'twilio',
  provider_sid             TEXT,                           -- Twilio SID
  agent_id                 UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL,
  is_recording_enabled     BOOLEAN NOT NULL DEFAULT false,
  recording_retention_days INTEGER NOT NULL DEFAULT 30,
  voicemail_greeting_url   TEXT,
  ivr_config               JSONB NOT NULL DEFAULT '{}',
  caller_id_override       TEXT,
  number_type              TEXT NOT NULL DEFAULT 'local' CHECK (number_type IN ('local', 'toll-free', 'mobile', 'imported')),
  is_active                BOOLEAN NOT NULL DEFAULT true,
  monthly_cost_micro       INTEGER NOT NULL DEFAULT 0,    -- microcurrency
  currency_code            CHAR(3) NOT NULL DEFAULT 'INR',
  purchased_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT phone_numbers_e164_format CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$'),
  CONSTRAINT phone_numbers_currency    CHECK (currency_code ~ '^[A-Z]{3}$')
);

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
  org_id             UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
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
  price_monthly_micro      INTEGER NOT NULL DEFAULT 0,   -- e.g. 9999000000 = ₹9,999
  price_annual_micro       INTEGER NOT NULL DEFAULT 0,
  currency_code            CHAR(3) NOT NULL DEFAULT 'INR',
  max_agents               INTEGER,                      -- NULL = unlimited
  max_workspaces           INTEGER,
  max_seats                INTEGER,
  minutes_included         INTEGER NOT NULL DEFAULT 0,
  extra_minute_price_micro INTEGER NOT NULL DEFAULT 0,
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
    'Starter', 'starter', 9999000000, 99990000000, 'INR', 5, 3, 10, 500,
    '{"analytics":"advanced","support":"email","custom_greetings":true,"ivr_builder":false,"audit_logs":false,"api_access":false}'::JSONB
  ),
  (
    'Growth', 'growth', 24999000000, 249990000000, 'INR', NULL, NULL, NULL, 2000,
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
  overage_micro     INTEGER NOT NULL DEFAULT 0,
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
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  subscription_id       UUID REFERENCES public.subscriptions (id) ON DELETE SET NULL,
  amount_micro          INTEGER NOT NULL,              -- microcurrency
  currency_code         CHAR(3) NOT NULL DEFAULT 'INR',
  status                TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  plan_name             TEXT,
  description           TEXT,
  razorpay_payment_id   TEXT,
  razorpay_invoice_id   TEXT,
  invoice_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT invoices_currency CHECK (currency_code ~ '^[A-Z]{3}$')
);

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
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  phone_e164   TEXT NOT NULL,
  reason       TEXT,
  added_by     UUID REFERENCES auth.users (id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT dnc_phone_e164_format CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$'),
  UNIQUE (org_id, phone_e164)
);

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
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  contact_id   UUID REFERENCES public.contacts (id) ON DELETE SET NULL,
  agent_id     UUID REFERENCES public.ai_agents (id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('opt-in', 'opt-out')),
  date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recording_ref TEXT,
  expiry       TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  call_id      UUID REFERENCES public.calls (id) ON DELETE SET NULL,
  event_type   TEXT NOT NULL CHECK (event_type IN (
    'call_blocked', 'consent_granted', 'consent_revoked',
    'dnc_added', 'dnc_removed', 'irdai_check_failed',
    'passport_decrypted', 'gdpr_export_requested', 'data_deleted'
  )),
  status       TEXT NOT NULL,
  details      JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id  UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  user_id       UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  details       JSONB NOT NULL DEFAULT '{}',
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
-- =============================================================================
-- Migration: 20260713000000_insurance_vertical.sql
-- Date: 2026-07-13
-- Description: All 9 insurance vertical tables with org_id, microcurrency money
--              columns, append-only policy_remarks, and org-scoped RLS.
-- Depends on: 20260615000000_core_platform.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE PIPELINE STAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_pipeline_stages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0,
  color        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_ins_pipeline_stages_org_id ON public.insurance_pipeline_stages (org_id);

DROP TRIGGER IF EXISTS update_ins_pipeline_stages_updated_at ON public.insurance_pipeline_stages;
CREATE TRIGGER update_ins_pipeline_stages_updated_at
  BEFORE UPDATE ON public.insurance_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.insurance_pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ins_pipeline_stages_org" ON public.insurance_pipeline_stages;
CREATE POLICY "ins_pipeline_stages_org" ON public.insurance_pipeline_stages
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- RELATIONSHIP EXECUTIVES (RE — internal agents/advisors)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.relationship_executives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  user_id      UUID REFERENCES auth.users (id) ON DELETE SET NULL,   -- linked platform user (optional)
  full_name    TEXT NOT NULL,
  email        TEXT,
  phone_e164   TEXT,
  employee_code TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT re_phone_e164 CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$')
);

CREATE INDEX IF NOT EXISTS idx_re_org_id ON public.relationship_executives (org_id);

DROP TRIGGER IF EXISTS update_re_updated_at ON public.relationship_executives;
CREATE TRIGGER update_re_updated_at
  BEFORE UPDATE ON public.relationship_executives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.relationship_executives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "re_org_isolation" ON public.relationship_executives;
CREATE POLICY "re_org_isolation" ON public.relationship_executives
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INTERMEDIARY MASTERS (brokers, agents, dealers)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intermediary_masters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by     UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('broker', 'agent', 'dealer', 'direct')),
  license_number TEXT,
  phone_e164     TEXT,
  email          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT intermediary_phone_e164 CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$')
);

CREATE INDEX IF NOT EXISTS idx_intermediary_org_id ON public.intermediary_masters (org_id);

DROP TRIGGER IF EXISTS update_intermediary_updated_at ON public.intermediary_masters;
CREATE TRIGGER update_intermediary_updated_at
  BEFORE UPDATE ON public.intermediary_masters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.intermediary_masters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "intermediary_org_isolation" ON public.intermediary_masters;
CREATE POLICY "intermediary_org_isolation" ON public.intermediary_masters
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_CONTACTS (insurance-specific CRM data for a contact)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_contacts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                 UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id           UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by             UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  contact_id             UUID NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  re_id                  UUID REFERENCES public.relationship_executives (id) ON DELETE SET NULL,
  intermediary_id        UUID REFERENCES public.intermediary_masters (id) ON DELETE SET NULL,
  pipeline_stage_id      UUID REFERENCES public.insurance_pipeline_stages (id) ON DELETE SET NULL,
  -- Insurance-specific fields
  date_of_birth          DATE,
  gender                 TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  occupation             TEXT,
  annual_income_micro    INTEGER NOT NULL DEFAULT 0,
  currency_code          CHAR(3) NOT NULL DEFAULT 'INR',
  marital_status         TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  dependents             INTEGER NOT NULL DEFAULT 0,
  is_smoker              BOOLEAN NOT NULL DEFAULT false,
  pre_existing_conditions TEXT[] NOT NULL DEFAULT '{}',
  driving_record         TEXT CHECK (driving_record IN ('Clean', 'Minor Violations', 'Major Violations')),
  property_type          TEXT CHECK (property_type IN ('Own', 'Rent', 'None')),
  notes                  TEXT,
  last_contact_date      TIMESTAMPTZ,
  next_follow_up_date    TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ins_contacts_currency CHECK (currency_code ~ '^[A-Z]{3}$'),
  UNIQUE (contact_id)    -- one insurance record per contact
);

CREATE INDEX IF NOT EXISTS idx_ins_contacts_org_id        ON public.insurance_contacts (org_id);
CREATE INDEX IF NOT EXISTS idx_ins_contacts_contact_id    ON public.insurance_contacts (contact_id);
CREATE INDEX IF NOT EXISTS idx_ins_contacts_pipeline_stage ON public.insurance_contacts (pipeline_stage_id);

DROP TRIGGER IF EXISTS update_ins_contacts_updated_at ON public.insurance_contacts;
CREATE TRIGGER update_ins_contacts_updated_at
  BEFORE UPDATE ON public.insurance_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.insurance_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ins_contacts_org_isolation" ON public.insurance_contacts;
CREATE POLICY "ins_contacts_org_isolation" ON public.insurance_contacts
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_GROUPS (corporate/group policies)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_groups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by     UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  re_id          UUID REFERENCES public.relationship_executives (id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  company_name   TEXT,
  gstin          TEXT,
  policy_type    TEXT,
  member_count   INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ins_groups_org_id ON public.insurance_groups (org_id);

DROP TRIGGER IF EXISTS update_ins_groups_updated_at ON public.insurance_groups;
CREATE TRIGGER update_ins_groups_updated_at
  BEFORE UPDATE ON public.insurance_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.insurance_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ins_groups_org_isolation" ON public.insurance_groups;
CREATE POLICY "ins_groups_org_isolation" ON public.insurance_groups
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_GROUP_MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_group_members (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  group_id             UUID NOT NULL REFERENCES public.insurance_groups (id) ON DELETE CASCADE,
  insurance_contact_id UUID NOT NULL REFERENCES public.insurance_contacts (id) ON DELETE CASCADE,
  member_role          TEXT DEFAULT 'member' CHECK (member_role IN ('primary', 'member', 'dependent')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, insurance_contact_id)
);

CREATE INDEX IF NOT EXISTS idx_ins_group_members_group_id   ON public.insurance_group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_ins_group_members_contact_id ON public.insurance_group_members (insurance_contact_id);

ALTER TABLE public.insurance_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ins_group_members_org_isolation" ON public.insurance_group_members;
CREATE POLICY "ins_group_members_org_isolation" ON public.insurance_group_members
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id            UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by              UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  insurance_contact_id    UUID NOT NULL REFERENCES public.insurance_contacts (id) ON DELETE CASCADE,
  group_id                UUID REFERENCES public.insurance_groups (id) ON DELETE SET NULL,
  re_id                   UUID REFERENCES public.relationship_executives (id) ON DELETE SET NULL,
  intermediary_id         UUID REFERENCES public.intermediary_masters (id) ON DELETE SET NULL,
  -- Policy identifiers
  policy_number           TEXT NOT NULL,
  policy_type             TEXT CHECK (policy_type IN ('Life', 'Auto', 'Home', 'Health', 'Commercial', 'Travel', 'Fire', 'Marine')),
  sub_product             TEXT,                              -- e.g. "Term Plan", "ULIP", "Endowment"
  carrier_name            TEXT,
  -- Financial (microcurrency)
  premium_amount_micro    INTEGER NOT NULL DEFAULT 0,
  premium_frequency       TEXT CHECK (premium_frequency IN ('Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Single')),
  ppt_years               INTEGER,                           -- Premium Payment Term
  sum_assured_micro       INTEGER NOT NULL DEFAULT 0,
  deductible_micro        INTEGER NOT NULL DEFAULT 0,
  currency_code           CHAR(3) NOT NULL DEFAULT 'INR',
  -- Dates
  start_date              DATE,
  end_date                DATE,
  next_renewal_date       DATE,
  -- Status
  status                  TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Lapsed', 'Cancelled', 'Pending', 'Under Review', 'Surrendered')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ins_policies_currency CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_ins_policies_org_id        ON public.insurance_policies (org_id);
CREATE INDEX IF NOT EXISTS idx_ins_policies_contact_id    ON public.insurance_policies (insurance_contact_id);
CREATE INDEX IF NOT EXISTS idx_ins_policies_renewal_date  ON public.insurance_policies (next_renewal_date);
CREATE INDEX IF NOT EXISTS idx_ins_policies_status        ON public.insurance_policies (status);

DROP TRIGGER IF EXISTS update_ins_policies_updated_at ON public.insurance_policies;
CREATE TRIGGER update_ins_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ins_policies_org_isolation" ON public.insurance_policies;
CREATE POLICY "ins_policies_org_isolation" ON public.insurance_policies
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_CLAIMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by      UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  policy_id       UUID NOT NULL REFERENCES public.insurance_policies (id) ON DELETE CASCADE,
  claim_number    TEXT,
  claim_date      DATE NOT NULL,
  claim_type      TEXT,
  claim_amount_micro INTEGER NOT NULL DEFAULT 0,
  currency_code   CHAR(3) NOT NULL DEFAULT 'INR',
  status          TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Settled', 'Rejected', 'Withdrawn')),
  description     TEXT,
  settled_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ins_claims_currency CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_ins_claims_org_id    ON public.insurance_claims (org_id);
CREATE INDEX IF NOT EXISTS idx_ins_claims_policy_id ON public.insurance_claims (policy_id);

DROP TRIGGER IF EXISTS update_ins_claims_updated_at ON public.insurance_claims;
CREATE TRIGGER update_ins_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ins_claims_org_isolation" ON public.insurance_claims;
CREATE POLICY "ins_claims_org_isolation" ON public.insurance_claims
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- POLICY_REMARKS (append-only call notes / remarks on a policy)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.policy_remarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  policy_id  UUID NOT NULL REFERENCES public.insurance_policies (id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  call_id    UUID REFERENCES public.calls (id) ON DELETE SET NULL,
  remark     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_remarks_policy_id ON public.policy_remarks (policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_remarks_org_id    ON public.policy_remarks (org_id);

ALTER TABLE public.policy_remarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_remarks_org_select" ON public.policy_remarks;
CREATE POLICY "policy_remarks_org_select" ON public.policy_remarks
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

DROP POLICY IF EXISTS "policy_remarks_org_insert" ON public.policy_remarks;
CREATE POLICY "policy_remarks_org_insert" ON public.policy_remarks
  FOR INSERT WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- Append-only — no UPDATE or DELETE
DROP TRIGGER IF EXISTS trg_policy_remarks_immutable ON public.policy_remarks;
CREATE TRIGGER trg_policy_remarks_immutable
  BEFORE UPDATE OR DELETE ON public.policy_remarks
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_table_mutation();
-- =============================================================================
-- Migration: 20260720000000_travel_vertical.sql
-- Date: 2026-07-20
-- Description: travel_pipeline_stages, travel_contacts (pgcrypto passport),
--              travel_bookings (booking_value_micro). All with org_id. RLS.
-- Depends on: 20260615000000_core_platform.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL_PIPELINE_STAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_pipeline_stages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0,
  color        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_travel_stages_org_id ON public.travel_pipeline_stages (org_id);

DROP TRIGGER IF EXISTS update_travel_stages_updated_at ON public.travel_pipeline_stages;
CREATE TRIGGER update_travel_stages_updated_at
  BEFORE UPDATE ON public.travel_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.travel_pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "travel_stages_org_isolation" ON public.travel_pipeline_stages;
CREATE POLICY "travel_stages_org_isolation" ON public.travel_pipeline_stages
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL_CONTACTS (with AES-256 encrypted passport via pgcrypto)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_contacts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                      UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id                UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by                  UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  contact_id                  UUID NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  pipeline_stage_id           UUID REFERENCES public.travel_pipeline_stages (id) ON DELETE SET NULL,
  -- Travel-specific fields
  nationality                 CHAR(2),                          -- ISO 3166-1 alpha-2
  date_of_birth               DATE,
  gender                      TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  -- Passport — encrypted with pgcrypto. Never stored in plaintext.
  -- Decrypt via: pgp_sym_decrypt(passport_number_encrypted::bytea, ENCRYPTION_KEY)
  passport_number_encrypted   TEXT,                             -- pgcrypto ciphertext (bytea stored as text)
  passport_expiry             DATE,
  passport_country            CHAR(2),
  visa_status                 TEXT CHECK (visa_status IN ('valid', 'expired', 'pending', 'none')),
  -- Preferences
  preferred_airlines          TEXT[] NOT NULL DEFAULT '{}',
  preferred_hotels            TEXT[] NOT NULL DEFAULT '{}',
  meal_preference             TEXT,
  seat_preference             TEXT CHECK (seat_preference IN ('window', 'aisle', 'middle', 'no_preference')),
  frequent_flyer_numbers      JSONB NOT NULL DEFAULT '{}',
  -- Emergency contact
  emergency_contact_name      TEXT,
  emergency_contact_phone_e164 TEXT,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT travel_contacts_nationality   CHECK (nationality IS NULL OR nationality ~ '^[A-Z]{2}$'),
  CONSTRAINT travel_contacts_passport_country CHECK (passport_country IS NULL OR passport_country ~ '^[A-Z]{2}$'),
  CONSTRAINT travel_contacts_emergency_phone CHECK (
    emergency_contact_phone_e164 IS NULL OR emergency_contact_phone_e164 ~ '^\+[1-9]\d{7,14}$'
  ),
  UNIQUE (contact_id)    -- one travel record per contact
);

CREATE INDEX IF NOT EXISTS idx_travel_contacts_org_id        ON public.travel_contacts (org_id);
CREATE INDEX IF NOT EXISTS idx_travel_contacts_contact_id    ON public.travel_contacts (contact_id);
CREATE INDEX IF NOT EXISTS idx_travel_contacts_pipeline_stage ON public.travel_contacts (pipeline_stage_id);
CREATE INDEX IF NOT EXISTS idx_travel_contacts_passport_expiry ON public.travel_contacts (passport_expiry);

DROP TRIGGER IF EXISTS update_travel_contacts_updated_at ON public.travel_contacts;
CREATE TRIGGER update_travel_contacts_updated_at
  BEFORE UPDATE ON public.travel_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.travel_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "travel_contacts_org_isolation" ON public.travel_contacts;
CREATE POLICY "travel_contacts_org_isolation" ON public.travel_contacts
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL_BOOKINGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id          UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  created_by            UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  travel_contact_id     UUID NOT NULL REFERENCES public.travel_contacts (id) ON DELETE CASCADE,
  pipeline_stage_id     UUID REFERENCES public.travel_pipeline_stages (id) ON DELETE SET NULL,
  -- Booking details
  booking_reference     TEXT,
  booking_type          TEXT CHECK (booking_type IN ('flight', 'hotel', 'package', 'cruise', 'car_rental', 'visa', 'insurance', 'other')),
  destination           TEXT,
  origin                TEXT,
  departure_date        DATE,
  return_date           DATE,
  passenger_count       INTEGER NOT NULL DEFAULT 1,
  -- Financial (microcurrency)
  booking_value_micro   INTEGER NOT NULL DEFAULT 0,
  commission_micro      INTEGER NOT NULL DEFAULT 0,
  currency_code         CHAR(3) NOT NULL DEFAULT 'INR',
  -- Status
  status                TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN (
    'inquiry', 'quoted', 'confirmed', 'ticketed', 'departed', 'completed', 'cancelled', 'refunded'
  )),
  -- Supplier / vendor
  supplier_name         TEXT,
  supplier_reference    TEXT,
  -- Notes
  special_requests      TEXT,
  internal_notes        TEXT,
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT travel_bookings_currency CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_travel_bookings_org_id        ON public.travel_bookings (org_id);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_contact_id    ON public.travel_bookings (travel_contact_id);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_departure     ON public.travel_bookings (departure_date);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_status        ON public.travel_bookings (status);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_pipeline_stage ON public.travel_bookings (pipeline_stage_id);

DROP TRIGGER IF EXISTS update_travel_bookings_updated_at ON public.travel_bookings;
CREATE TRIGGER update_travel_bookings_updated_at
  BEFORE UPDATE ON public.travel_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "travel_bookings_org_isolation" ON public.travel_bookings;
CREATE POLICY "travel_bookings_org_isolation" ON public.travel_bookings
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);
-- =============================================================================
-- Migration: 20260727000000_seed_demo.sql
-- Date: 2026-07-27
-- Description: user_settings, demo_sessions tables. Full demo org seed with
--              confirmed ₹ pricing. Supabase Realtime for all tables.
--              All wrapped in DO $$ IF NOT EXISTS guards — fully idempotent.
-- Depends on: all previous migrations (run LAST)
-- PRE-REQUISITE: testuser@example.com must exist in Supabase Auth before
--                running this migration.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USER_SETTINGS (encrypted API keys per org user)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES public.workspaces (id) ON DELETE SET NULL,
  key_name        TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,              -- pgcrypto encrypted
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, org_id, key_name)
);

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
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_org_id ON public.demo_sessions (org_id);

ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "demo_sessions_own" ON public.demo_sessions;
CREATE POLICY "demo_sessions_own" ON public.demo_sessions
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

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
  INSERT INTO public.ai_agents (id, org_id, workspace_id, created_by, name, description, agent_type, status, is_protected, is_default, greeting_message, goal_objective)
  VALUES (
    '00000000-0000-0000-0000-000000000010',
    v_demo_org_id, v_demo_workspace_id, v_demo_user_id,
    'Priya — Inbound Sales', 'Default inbound sales agent for demo', 'inbound', 'active', true, true,
    'Hello! This is Priya from SwiftCall. How can I help you today?',
    'Qualify the caller and schedule a demo call'
  )
  ON CONFLICT (id) DO NOTHING;
  v_demo_agent1_id := '00000000-0000-0000-0000-000000000010';

  INSERT INTO public.ai_agents (id, org_id, workspace_id, created_by, name, description, agent_type, status, is_protected, is_default, greeting_message, goal_objective)
  VALUES (
    '00000000-0000-0000-0000-000000000011',
    v_demo_org_id, v_demo_workspace_id, v_demo_user_id,
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
  INSERT INTO public.calls (org_id, workspace_id, created_by, agent_id, contact_id, phone_e164, direction, status, duration, sentiment, summary, call_cost_micro, currency_code)
  VALUES
    (v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_agent1_id, v_demo_contact1_id,
     '+919876543210', 'inbound', 'completed', 183, 'positive',
     'Caller inquired about the Growth plan. Qualified as hot lead. Follow-up scheduled.',
     15000000, 'INR'),
    (v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_agent2_id, v_demo_contact2_id,
     '+919876543211', 'outbound', 'completed', 95, 'neutral',
     'Follow-up call. Contact was interested but asked for a callback next week.',
     8000000, 'INR')
  ON CONFLICT DO NOTHING;

  -- 8. Mock campaign
  INSERT INTO public.campaigns (org_id, workspace_id, created_by, agent_id, name, description, status, total_contacts, completed_contacts)
  VALUES (
    v_demo_org_id, v_demo_workspace_id, v_demo_user_id, v_demo_agent2_id,
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
