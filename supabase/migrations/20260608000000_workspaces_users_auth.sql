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
-- Table may already exist from old schema — use ALTER TABLE to add new columns
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns idempotently (safe if column already exists)
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN agency_id UUID REFERENCES public.agencies (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN phone_e164 TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN is_demo_user BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN default_workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'en';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN country_code CHAR(2);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Add CHECK constraints idempotently
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_e164_format
    CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_country_code_format
    CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- NOTE: on_auth_user_created trigger on auth.users is created via Supabase Dashboard
-- or the combined SQL script below must be run in SQL Editor with service role.
-- The trigger calls public.handle_new_user() which is defined in public schema.
-- Adding it here will fail via CLI due to auth schema restrictions.
-- Run manually in Supabase SQL Editor:
--
--   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--   CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- MANUAL STEP REQUIRED — Run the following in Supabase SQL Editor:
-- (auth schema is not writable via CLI migrations)
--
-- STEP 1: Run this SQL in Supabase SQL Editor → New Query:
--
--   CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event JSONB)
--   RETURNS JSONB LANGUAGE plpgsql AS $$
--   DECLARE
--     v_profile   RECORD;
--     v_role      TEXT;
--   BEGIN
--     SELECT p.org_id, p.agency_id, p.default_workspace_id AS workspace_id,
--            p.is_demo_user, o.is_demo, o.isolation_level, o.data_region
--     INTO v_profile
--     FROM public.profiles p
--     LEFT JOIN public.organizations o ON o.id = p.org_id
--     WHERE p.id = (event ->> 'user_id')::UUID;
--
--     SELECT role::TEXT INTO v_role
--     FROM public.user_workspace_roles
--     WHERE user_id = (event ->> 'user_id')::UUID AND is_active = true
--     ORDER BY created_at ASC LIMIT 1;
--
--     event := jsonb_set(event, '{claims,org_id}',       to_jsonb(COALESCE(v_profile.org_id::TEXT, '')));
--     event := jsonb_set(event, '{claims,agency_id}',    to_jsonb(COALESCE(v_profile.agency_id::TEXT, '')));
--     event := jsonb_set(event, '{claims,workspace_id}', to_jsonb(COALESCE(v_profile.workspace_id::TEXT, '')));
--     event := jsonb_set(event, '{claims,role}',          to_jsonb(COALESCE(v_role, 'agent')));
--     event := jsonb_set(event, '{claims,is_demo}',       to_jsonb(COALESCE(v_profile.is_demo, false)));
--     RETURN event;
--   END; $$;
--
-- STEP 2: Supabase Dashboard → Authentication → Hooks
--         → Custom Access Token → select auth.custom_access_token_hook
-- =============================================================================
