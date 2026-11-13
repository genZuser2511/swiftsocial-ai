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
