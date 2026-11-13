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
