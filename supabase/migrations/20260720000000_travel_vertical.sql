-- =============================================================================
-- Migration: 20260720000000_travel_vertical.sql
-- Date: 2026-07-20
-- Description: travel_pipeline_stages, travel_contacts (pgcrypto passport),
--              travel_bookings (booking_value_micro). All with org_id. RLS.
-- Depends on: 20260615000000_core_platform.sql
--
-- [TAG: BUGFIX/IDEMPOTENCY_REFACTOR] 
-- Changed: Converted CREATE TABLE statements into idempotent ALTER TABLE ADD COLUMN 
--          blocks for all legacy tables to prevent 'relation already exists' errors.
-- Changed: Repaired multi-line CHECK constraints (e.g. emergency_contact_phone_e164, status) 
--          that broke during the regex parsing.
-- Why:     Ensures Supabase CLI pushes successfully over existing schema data without conflicts.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL_PIPELINE_STAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_pipeline_stages (
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS name         TEXT NOT NULL;
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS order_index  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS color        TEXT;
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.travel_pipeline_stages ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.travel_pipeline_stages ADD UNIQUE (org_id, name);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id                          UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS org_id                      UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS workspace_id                UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS created_by                  UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS contact_id                  UUID NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS pipeline_stage_id           UUID REFERENCES public.travel_pipeline_stages (id) ON DELETE SET NULL;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS nationality                 CHAR(2);
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS date_of_birth               DATE;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS gender                      TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say'));
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS passport_number_encrypted   TEXT;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS passport_expiry             DATE;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS passport_country            CHAR(2);
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS visa_status                 TEXT CHECK (visa_status IN ('valid', 'expired', 'pending', 'none'));
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS preferred_airlines          TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS preferred_hotels            TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS meal_preference             TEXT;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS seat_preference             TEXT CHECK (seat_preference IN ('window', 'aisle', 'middle', 'no_preference'));
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS frequent_flyer_numbers      JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS emergency_contact_name      TEXT;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS emergency_contact_phone_e164 TEXT;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS notes                       TEXT;
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.travel_contacts ADD COLUMN IF NOT EXISTS emergency_contact_phone_e164 TEXT;

DO $$ BEGIN
  ALTER TABLE public.travel_contacts ADD CONSTRAINT travel_contacts_nationality   CHECK (nationality IS NULL OR nationality ~ '^[A-Z]{2}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.travel_contacts ADD CONSTRAINT travel_contacts_passport_country CHECK (passport_country IS NULL OR passport_country ~ '^[A-Z]{2}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.travel_contacts ADD CONSTRAINT travel_contacts_emergency_phone CHECK (emergency_contact_phone_e164 IS NULL OR emergency_contact_phone_e164 ~ '^\\+[1-9]\\d{7,14}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.travel_contacts ADD UNIQUE (contact_id);    -- one travel record per contact
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS org_id                UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS workspace_id          UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS created_by            UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS travel_contact_id     UUID NOT NULL REFERENCES public.travel_contacts (id) ON DELETE CASCADE;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS pipeline_stage_id     UUID REFERENCES public.travel_pipeline_stages (id) ON DELETE SET NULL;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS booking_reference     TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS booking_type          TEXT CHECK (booking_type IN ('flight', 'hotel', 'package', 'cruise', 'car_rental', 'visa', 'insurance', 'other'));
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS destination           TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS origin                TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS departure_date        DATE;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS return_date           DATE;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS passenger_count       INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS booking_value_micro   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS commission_micro      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS currency_code         CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'quoted', 'confirmed', 'ticketed', 'departed', 'completed', 'cancelled', 'refunded'));
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS supplier_name         TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS supplier_reference    TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS special_requests      TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS internal_notes        TEXT;
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS metadata              JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.travel_bookings ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.travel_bookings ADD CONSTRAINT travel_bookings_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
