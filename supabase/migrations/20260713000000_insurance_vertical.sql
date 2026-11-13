-- =============================================================================
-- Migration: 20260713000000_insurance_vertical.sql
-- Date: 2026-07-13
-- Description: All 9 insurance vertical tables with org_id, microcurrency money
--              columns, append-only policy_remarks, and org-scoped RLS.
-- Depends on: 20260615000000_core_platform.sql
--
-- [TAG: BUGFIX/IDEMPOTENCY_REFACTOR] 
-- Changed: Converted CREATE TABLE statements into idempotent ALTER TABLE ADD COLUMN 
--          blocks for all legacy tables (e.g., insurance_pipeline_stages).
-- Why:     Prevents 'relation already exists' and 'column does not exist' errors 
--          when pushing changes over an existing legacy schema using Supabase CLI.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE PIPELINE STAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_pipeline_stages (
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS name         TEXT NOT NULL;
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS order_index  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS color        TEXT;
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.insurance_pipeline_stages ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.insurance_pipeline_stages ADD UNIQUE (org_id, name);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS org_id       UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS created_by   UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS full_name    TEXT NOT NULL;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS email        TEXT;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS phone_e164   TEXT;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS employee_code TEXT;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.relationship_executives ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.relationship_executives ADD CONSTRAINT re_phone_e164 CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS org_id         UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS workspace_id   UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS created_by     UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS name           TEXT NOT NULL;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS type           TEXT NOT NULL CHECK (type IN ('broker', 'agent', 'dealer', 'direct'));
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS phone_e164     TEXT;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS email          TEXT;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS is_active      BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.intermediary_masters ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.intermediary_masters ADD CONSTRAINT intermediary_phone_e164 CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id                     UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS org_id                 UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS workspace_id           UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS created_by             UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS contact_id             UUID NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS re_id                  UUID REFERENCES public.relationship_executives (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS intermediary_id        UUID REFERENCES public.intermediary_masters (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS pipeline_stage_id      UUID REFERENCES public.insurance_pipeline_stages (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS date_of_birth          DATE;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS gender                 TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say'));
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS occupation             TEXT;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS annual_income_micro    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS currency_code          CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS marital_status         TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed'));
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS dependents             INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS is_smoker              BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS pre_existing_conditions TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS driving_record         TEXT CHECK (driving_record IN ('Clean', 'Minor Violations', 'Major Violations'));
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS property_type          TEXT CHECK (property_type IN ('Own', 'Rent', 'None'));
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS notes                  TEXT;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS last_contact_date      TIMESTAMPTZ;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS next_follow_up_date    TIMESTAMPTZ;
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.insurance_contacts ADD COLUMN IF NOT EXISTS updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.insurance_contacts ADD CONSTRAINT ins_contacts_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.insurance_contacts ADD UNIQUE (contact_id);    -- one insurance record per contact
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS org_id         UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS workspace_id   UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS created_by     UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS re_id          UUID REFERENCES public.relationship_executives (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS name           TEXT NOT NULL;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS company_name   TEXT;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS gstin          TEXT;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS policy_type    TEXT;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS member_count   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS is_active      BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.insurance_groups ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();



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
id                   UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.insurance_group_members ADD COLUMN IF NOT EXISTS org_id               UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_group_members ADD COLUMN IF NOT EXISTS group_id             UUID NOT NULL REFERENCES public.insurance_groups (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_group_members ADD COLUMN IF NOT EXISTS insurance_contact_id UUID NOT NULL REFERENCES public.insurance_contacts (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_group_members ADD COLUMN IF NOT EXISTS member_role          TEXT DEFAULT 'member' CHECK (member_role IN ('primary', 'member', 'dependent'));
ALTER TABLE public.insurance_group_members ADD COLUMN IF NOT EXISTS created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.insurance_group_members ADD UNIQUE (group_id, insurance_contact_id);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id                      UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS org_id                  UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS workspace_id            UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS created_by              UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS insurance_contact_id    UUID NOT NULL REFERENCES public.insurance_contacts (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS group_id                UUID REFERENCES public.insurance_groups (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS re_id                   UUID REFERENCES public.relationship_executives (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS intermediary_id         UUID REFERENCES public.intermediary_masters (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS policy_number           TEXT NOT NULL;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS policy_type             TEXT CHECK (policy_type IN ('Life', 'Auto', 'Home', 'Health', 'Commercial', 'Travel', 'Fire', 'Marine'));
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS sub_product             TEXT;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS carrier_name            TEXT;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS premium_amount_micro    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS premium_frequency       TEXT CHECK (premium_frequency IN ('Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Single'));
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS ppt_years               INTEGER;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS sum_assured_micro       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS deductible_micro        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS currency_code           CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS start_date              DATE;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS end_date                DATE;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS next_renewal_date       DATE;
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS status                  TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Lapsed', 'Cancelled', 'Pending', 'Under Review', 'Surrendered'));
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.insurance_policies ADD CONSTRAINT ins_policies_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS org_id          UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS workspace_id    UUID REFERENCES public.workspaces (id) ON DELETE SET NULL;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS created_by      UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS policy_id       UUID NOT NULL REFERENCES public.insurance_policies (id) ON DELETE CASCADE;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_number    TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_date      DATE NOT NULL;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_type      TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_amount_micro INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS currency_code   CHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Settled', 'Rejected', 'Withdrawn'));
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS description     TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS settled_at      TIMESTAMPTZ;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE public.insurance_claims ADD CONSTRAINT ins_claims_currency CHECK (currency_code ~ '^[A-Z]{3}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

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
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.policy_remarks ADD COLUMN IF NOT EXISTS org_id     UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE;
ALTER TABLE public.policy_remarks ADD COLUMN IF NOT EXISTS policy_id  UUID NOT NULL REFERENCES public.insurance_policies (id) ON DELETE CASCADE;
ALTER TABLE public.policy_remarks ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT;
ALTER TABLE public.policy_remarks ADD COLUMN IF NOT EXISTS call_id    UUID REFERENCES public.calls (id) ON DELETE SET NULL;
ALTER TABLE public.policy_remarks ADD COLUMN IF NOT EXISTS remark     TEXT NOT NULL;
ALTER TABLE public.policy_remarks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();



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
