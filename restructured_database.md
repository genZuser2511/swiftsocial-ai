# SwiftCall AI Platform — Architecture Plan
**Version 2.5 · May 2026 · Confidential**
*Prepared for internal use — SwiftCall AI development team*

> **Status:** All decisions confirmed. Only remaining actions: Razorpay plan IDs (post S6) and minute pricing (before S6).

---

## Table of Contents

1. [Overview & Confirmed Stack](#1-overview--confirmed-stack)
2. [Account Hierarchy](#2-account-hierarchy)
3. [Domain & Hosting](#3-domain--hosting)
4. [Auth Architecture](#4-auth-architecture)
5. [Schema Table Manifest](#5-schema-table-manifest)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Migration File Details](#7-migration-file-details)
8. [Google Antigravity 2.0 Workflow](#8-google-antigravity-20-workflow)
9. [RLS Strategy](#9-rls-strategy)
10. [Retell AI + Twilio Integration](#10-retell-ai--twilio-integration)
11. [Billing & Pricing — Razorpay](#11-billing--pricing--razorpay)
12. [White-label & Agency Layer (Future)](#12-white-label--agency-layer--future)
13. [Global Support](#13-global-support)
14. [Demo Account](#14-demo-account)
15. [Frontend Catch-up Rule](#15-frontend-catch-up-rule)
16. [Sprint Roadmap — Final](#16-sprint-roadmap--final)

---

## 1. Overview & Confirmed Stack

> **v2.5 updates:** Pricing confirmed. Vercel Free confirmed. Old `schema.sql` and protected agents SQL retired. `supabase/` folder is the single source of truth for all database files. Frontend catch-up sprints added after all backend sprints complete.

> **⛔ RETIRED FILES — Do not use ever again:**
> - The old `AI Call Center CRM Schema` SQL saved in Supabase SQL Editor — retired
> - The old `Protect and Seed Default Agents` SQL file — retired (replaced by migration 10 seed with `is_protected = true`)
> - All new schema work happens exclusively in `supabase/migrations/`

### Confirmed Technology Stack

| Layer | Technology | Status | Notes |
|---|---|---|---|
| IDE / Agent | Google Antigravity 2.0 | ✅ Confirmed | Writes code, runs terminal, pushes migrations via agy CLI |
| Frontend | Next.js (App Router) + React 19 | ✅ Confirmed | Tenant-aware middleware for domain routing |
| Database | Supabase (PostgreSQL) — same project | ✅ Confirmed | Multi-tenant via RLS |
| Auth | Supabase Auth + JWT custom claims | ✅ Confirmed | Hierarchy scoping via Auth hook |
| Voice agents | Retell AI | ✅ Confirmed | LLM, STT, TTS, voice execution |
| Telephony | Twilio + Retell AI | ✅ Confirmed | Twilio for numbers/SIP, Retell for calls |
| Payments | Razorpay | ✅ Confirmed | India-first, global capable |
| Deployment | Vercel Free | ✅ Confirmed | app + admin domains only |
| DNS | Cloudflare Free | ✅ Confirmed | Domain management |
| Schema management | Supabase CLI migrations | ✅ Confirmed | supabase/migrations/ folder in project root |
| Pricing — Free | ₹0/mo | ✅ Confirmed | 1 Agent, Basic Analytics, Community Support |
| Pricing — Starter | ₹9,999/mo | ✅ Confirmed | 5 Agents, Email Support, Advanced Analytics, Custom Greetings |
| Pricing — Growth | ₹24,999/mo | ✅ Confirmed | Unlimited Agents, Priority Support, IVR Builder, Audit Logs, API Access |
| Pricing — Enterprise | Custom | ✅ Confirmed | Custom Minutes, Dedicated AM, SLA, On-premise |
| White-label / agency subdomains | Schema ready — infra deferred | 🟡 Future F1 | Activate when first agency client signs up |
| Razorpay plan IDs | Create in Razorpay dashboard | 🟡 Action after S6 | Create 3 plans matching confirmed pricing |
| Old schema.sql | RETIRED | ⛔ Retired | Never run again |
| Old protected agents SQL | RETIRED | ⛔ Retired | Replaced by migration 10 |

### Key Constraints

- **Fresh start** — existing DB is legacy/demo. All migrations create from scratch with drop guards.
- **Global from day 1** — multi-currency, UTC timestamps, E.164 phone numbers, ISO codes everywhere.
- **Agency/Partner layer + White-label** — in schema from day one, infrastructure deferred.
- **Demo org isolated** — `is_demo` flag, outside billing, seeded in final migration.
- **testuser@example.com** — demo org, protected agents, untouched by hierarchy.
- **Super Admin** — never an org user. Service role key server-side only. Separate portal.
- **Razorpay** — all billing wired through Razorpay, webhook-driven state management.
- **CONSTRAINTS.md single-file requirement** — overridden. Supabase CLI migration files used instead.

---

## 2. Account Hierarchy

6-level hierarchy. Data access strictly downward. Super Admin invisible to all clients.

```
Level 0 — Super Admin (Pranit / internal team)
│   God-mode. All orgs, all data, all usage.
│   admin.yourdomain.com. Service role key server-side only.
│   All actions immutably audit-logged.
│
└── Level 1 — Agency / Partner / Reseller  [WHITE-LABEL FUTURE]
│       agencies table in schema from day one.
│       agency_id nullable on orgs. No agencies used in Phase 1.
│
    └── Level 2 — Organization  (primary billing unit, Razorpay customer)
    │       The paying customer. razorpay_customer_id + subscription.
    │       isolation_level + data_region immutable after creation.
    │
        └── Level 3 — Workspace / Department
        │       Own agents, contacts, campaigns, KB.
        │       Workspace Admin scoped to their workspace only.
        │
            └── Level 4 — Team
            │       Grouping within a Workspace. Manager has scoped access.
            │
                └── Level 5 — User
                        Roles: org_admin, workspace_admin, manager,
                               agent, viewer, billing_only
                        Assigned per workspace via user_workspace_roles.
```

### Data Visibility Rules

| Role | Can see | Cannot see |
|---|---|---|
| Super Admin | Everything across all orgs | Nothing hidden |
| Agency Admin | All orgs under their agency (future) | Other agencies' orgs |
| Org Admin | All workspaces in their org | Other orgs |
| Workspace Admin | Their workspace only | Other workspaces in same org |
| Manager | Their team within workspace | Other teams |
| Agent | Their own calls/tasks only | Other agents' data |
| Viewer | Read-only within workspace | Cannot create or edit |

### Universal Column Rule — Every Tenant Data Table

```sql
agency_id         UUID  REFERENCES agencies(id)         -- nullable
org_id            UUID  NOT NULL REFERENCES organizations(id)
workspace_id      UUID  REFERENCES workspaces(id)       -- nullable for org-level data
team_id           UUID  REFERENCES teams(id)            -- nullable
created_by        UUID  NOT NULL REFERENCES auth.users(id)
created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 3. Domain & Hosting

> **Current setup will be:** Vercel Free + Cloudflare DNS. Two fixed domains only. No wildcard needed until white-label activated.

### Current One-time Setup — Do in This Order

| Step | Action | Notes |
|---|---|---|
| 1 | Move domain DNS to Cloudflare (free) | Change nameservers at registrar. 5–30 min propagation. |
| 2 | Cloudflare DNS: CNAME app subdomain | Name=app, Target=cname.vercel-dns.com, Proxy=OFF |
| 3 | Cloudflare DNS: CNAME admin subdomain | Name=admin, Target=cname.vercel-dns.com, Proxy=OFF |
| 4 | Vercel main project — add app.yourdomain.com | Project → Settings → Domains |
| 5 | New Vercel project for admin portal | Add admin.yourdomain.com as its domain. IP-allowlist it. |

### Portal Routing

| URL | Who uses it | Vercel tier needed | Auth |
|---|---|---|---|
| app.yourdomain.com | All org clients (all plans) | Free ✅ | Supabase Auth JWT |
| admin.yourdomain.com | Super Admin only | Free ✅ | Service role, TOTP 2FA mandatory |
| {slug}.yourdomain.com | Agency white-label portals | Pro — Future 🟡 | Future activation only |
| {custom}.agency.com | Agency custom domain | Pro — Future 🟡 | Future activation only |

> **White-label upgrade trigger:** First agency client signs up. Upgrade Vercel to Pro ($20/mo), add wildcard CNAME `*` in Cloudflare pointing to `cname.vercel-dns.com`. Zero schema changes needed — agencies table already waiting.

---

## 4. Auth Architecture

Supabase Auth + custom JWT claims hook. No self-signup. All accounts created by the level above via invite-only flow.

### JWT Custom Claims Hook (migration 02)

```sql
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_profile RECORD; v_role TEXT;
BEGIN
  SELECT p.org_id, p.agency_id, p.workspace_id, p.is_demo_user,
         o.is_demo, o.isolation_level, o.data_region
  INTO v_profile
  FROM public.profiles p
  LEFT JOIN public.organizations o ON o.id = p.org_id
  WHERE p.id = (event ->> 'user_id')::UUID;

  SELECT role INTO v_role FROM public.user_workspace_roles
  WHERE user_id = (event ->> 'user_id')::UUID AND is_active = true
  ORDER BY created_at ASC LIMIT 1;

  event := jsonb_set(event, '{claims, org_id}', to_jsonb(v_profile.org_id::TEXT));
  event := jsonb_set(event, '{claims, workspace_id}', to_jsonb(v_profile.workspace_id::TEXT));
  event := jsonb_set(event, '{claims, agency_id}',    to_jsonb(v_profile.agency_id::TEXT));
  event := jsonb_set(event, '{claims, app_role}',          to_jsonb(COALESCE(v_role, 'agent')));
  event := jsonb_set(event, '{claims, is_demo}',       to_jsonb(COALESCE(v_profile.is_demo, false)));
  RETURN event;
END; $$;

-- After pushing migration 02:
-- Supabase dashboard → Auth → Hooks → Custom Access Token → select this function
```

### JWT Token Structure

```json
{
  "sub":          "auth-user-uuid",
  "email":        "john@alphainsurance.com",
  "org_id":       "uuid",
  "agency_id":    "uuid-or-null",
  "workspace_id": "uuid-or-null",
  "role":         "org_admin",
  "is_demo":      false,
  "exp":          1748217600
}
```

### Login Routing

| Who | URL | Lands on | 2FA |
|---|---|---|---|
| Super Admin | admin.yourdomain.com/login | Platform overview — all orgs | Mandatory TOTP |
| Agency Admin | app.yourdomain.com/login | Agency client list | Mandatory TOTP |
| Org Admin | app.yourdomain.com/login | Full dashboard — all workspaces | Optional (mandatory Enterprise) |
| Agent / Viewer | app.yourdomain.com/login | Scoped view — own data only | Optional |

> **⛔ Service role key rule:** Server-side only. Never in browser. Super Admin has zero rows in `profiles` or `user_workspace_roles` tables.

---

## 5. Schema Table Manifest

All tables in dependency order. White-label columns kept from day one — infrastructure deferred. Old fields (`user_id` as sole tenant key, `phone_number`, flat structure) fully replaced.

### Tier 1 — Agencies & Organizations · migration 01

| Table | Key columns | Phase 1? |
|---|---|---|
| agencies | id, name, slug UNIQUE, subdomain, custom_domain, custom_domain_verified, custom_domain_verification_token, branding_settings JSONB, razorpay_customer_id, is_active, is_demo | Schema only — no rows |
| organizations | id, agency_id FK (nullable), name, slug UNIQUE, isolation_level ENUM, data_region CHAR(2), compliance_flags TEXT[], is_demo, is_active, subdomain, custom_domain, branding_settings JSONB, razorpay_customer_id, default_currency CHAR(3), default_language | Yes — primary entity |

### Tier 2 — Workspaces, Teams, Users · migration 02

| Table | Key columns |
|---|---|
| workspaces | id, org_id FK, name, description, is_active |
| teams | id, org_id FK, workspace_id FK, name |
| profiles | id = auth.users.id, org_id FK, agency_id FK (nullable), full_name, email, phone_e164, avatar_url, is_demo_user, default_workspace_id FK, onboarding_completed, preferred_language, country_code CHAR(2), timezone |
| user_workspace_roles | id, user_id FK, org_id FK, workspace_id FK, team_id FK (nullable), role user_role ENUM, is_active — UNIQUE(user_id, workspace_id) |
| invitations | id, org_id FK, workspace_id FK, invited_by FK, email, role, token UNIQUE, status ENUM, expires_at |

### Tier 3 — Core Platform · migration 03

| Table | Key changes vs old schema |
|---|---|
| ai_agents | + org_id, workspace_id (was user_id only). + is_protected BOOL. + retell_agent_id TEXT. + system_prompt, greeting_message. + goal_objective, post_call_action, escalation_trigger. + agent_type ENUM. |
| contacts | Replaces leads table entirely. phone_e164 (was phone_number). + company, country_code, timezone, dnc_status. + last_called_at, last_call_outcome. |
| contact_lists + contact_list_members | New — did not exist in old schema. |
| calls | + org_id, workspace_id. phone_e164. call_cost_micro INTEGER + currency_code (was DECIMAL). + retell_call_id TEXT UNIQUE. + twilio_call_sid. transcript now JSONB. |
| campaigns + campaign_contacts | + start_at, end_at, timezone, caller_id FK, retry_max, calls_per_hour. campaign_contacts is new. |
| knowledge_base + chunks | + org_id, workspace_id. knowledge_base_chunks new (for pgvector embeddings). |
| workflows + workflow_runs | + org_id, workspace_id. workflow_runs is new (execution log). |
| messages | + org_id, workspace_id. contact_id FK (was lead_id FK). |
| analytics_daily | call_cost_micro + currency_code (was cost_savings DECIMAL). + workspace_id. UNIQUE(org_id, workspace_id, date). |

### Tiers 4–10 Summary

| Migration | Tables | Key changes |
|---|---|---|
| 04 Telephony | phone_numbers, retell_agents, twilio_webhook_logs | retell_agents: fully new. twilio_webhook_logs: append-only. |
| 05 Billing | subscription_plans, subscriptions, seat_assignments, usage_records, invoices, razorpay_webhook_logs | All redesigned. invoices: amount_micro + currency_code. razorpay_webhook_logs: new. |
| 06 Compliance | dnc_list, consent_records, compliance_audit_logs, audit_logs | All append-only. audit_logs fully new (was not separate). |
| 07 Insurance | All 9 insurance tables | + org_id on all. All money columns now _micro INTEGER + currency_code. |
| 08 Travel | travel_pipeline_stages, travel_contacts, travel_bookings | + org_id. pgcrypto on passport. booking_value_micro. |
| 09 User settings | user_settings | + org_id FK added. pgcrypto encrypted values. |
| 10 Seed | demo_sessions + full demo seed | demo_sessions new. Seed targets org/workspace hierarchy. |

---

## 6. Project Folder Structure

> **⛔ Retired:** Do not open `AI Call Center CRM Schema` or `Protect and Seed Default Agents` in Supabase SQL Editor. All new work is in `supabase/migrations/` only.

```
swiftcall-ai/
│
├── supabase/                               ← ALL database files. Open to see/edit schema.
│   ├── migrations/                         ← one file per sprint. CLI push OR copy-paste.
│   │   ├── 20260601000000_extensions_enums.sql          ← run FIRST always
│   │   ├── 20260601000001_agencies_organizations.sql
│   │   ├── 20260608000000_workspaces_users_auth.sql
│   │   ├── 20260615000000_core_platform.sql
│   │   ├── 20260622000000_telephony.sql
│   │   ├── 20260629000000_billing_razorpay.sql
│   │   ├── 20260706000000_compliance.sql
│   │   ├── 20260713000000_insurance_vertical.sql
│   │   ├── 20260720000000_travel_vertical.sql
│   │   └── 20260727000000_seed_demo.sql
│   ├── config.toml                         ← Supabase CLI project config
│   └── seed.sql                            ← local dev only (mirrors migration 10)
│
├── src/                                    ← Next.js app
│   ├── app/                                ← App Router pages
│   ├── components/
│   ├── lib/supabase.ts                     ← Supabase client setup
│   └── middleware.ts                       ← tenant detection (domain routing)
│
├── ARCHITECTURE.md                         ← this file (Antigravity reads it every session)
├── CONSTRAINTS.md                          ← updated: single-file req overridden
├── .env.local                              ← env vars (never commit to git)
└── package.json
```

### Two Ways to Apply Each Migration File

| Method | How | When to use |
|---|---|---|
| A — Antigravity CLI push (recommended) | Antigravity writes .sql file → runs `npx supabase db push` → applied automatically | Default — when Antigravity has terminal access |
| B — Manual copy-paste | Open .sql file → copy → Supabase SQL Editor → New Query → paste → Run | When Antigravity cannot push directly |

> **⚠️ Manual paste rule:** Always run files in timestamp order — `000000` first, then `000001`, then `000002` etc. Running out of order causes foreign key errors.

### Environment Variables — .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-side only, never expose
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
RETELL_API_KEY=your-retell-key
# VERCEL_API_TOKEN=       ← leave empty until white-label activated
# VERCEL_PROJECT_ID=      ← leave empty until white-label activated
```

---

## 7. Migration File Details

> Every file is idempotent (safe to re-run). Can be applied via CLI push or manual copy-paste. Always run in timestamp order.

| File | Contains | Sprint |
|---|---|---|
| 20260601000000_extensions_enums.sql | Extensions (uuid-ossp, pgcrypto). All ENUMs (user_role, isolation_level, call_status, call_direction, campaign_status, plan_tier, invite_status, billing_cycle, sub_status). Utility functions: update_updated_at_column(), validate_e164_phone(), validate_iso_currency(), validate_iso_country(). Idempotent. Run first always. | S1 |
| 20260601000001_agencies_organizations.sql | agencies + organizations tables. All CHECK constraints (data_region, currency_code, country_code, E.164 phone). data_region immutability trigger. RLS for both tables. Indexes on slug, subdomain, custom_domain. | S1 |
| 20260608000000_workspaces_users_auth.sql | workspaces, teams, profiles, user_workspace_roles, invitations. on_auth_user_created trigger. auth.custom_access_token_hook() function. RLS. Indexes. **Manual step after push:** register hook in Supabase dashboard → Auth → Hooks. | S2 |
| 20260615000000_core_platform.sql | All Tier 3 tables (ai_agents through analytics_daily). sync_agent_stats(), auto_create_contact_from_call(), prevent_protected_agent_deletion() triggers. Full RLS (org + workspace scoped). All indexes. Supabase Realtime on key tables. Largest migration file. | S4 |
| 20260622000000_telephony.sql | phone_numbers, retell_agents, twilio_webhook_logs. Append-only RLS + prevent_immutable_table_mutation() trigger on twilio_webhook_logs. Indexes. | S5 |
| 20260629000000_billing_razorpay.sql | subscription_plans (seeded with ₹ pricing), subscriptions, seat_assignments, usage_records, invoices, razorpay_webhook_logs. Append-only RLS on webhook logs. Indexes. | S6 |
| 20260706000000_compliance.sql | dnc_list, consent_records, compliance_audit_logs, audit_logs. Append-only RLS + prevent_immutable_table_mutation() trigger on all four tables. Indexes. | S7 |
| 20260713000000_insurance_vertical.sql | All 9 insurance tables: pipeline_stages, insurance_contacts, relationship_executives, intermediary_masters, insurance_groups, insurance_group_members, insurance_policies, insurance_claims, policy_remarks. policy_remarks append-only trigger. Org-scoped RLS. Indexes. | S8 |
| 20260720000000_travel_vertical.sql | travel_pipeline_stages, travel_contacts (pgcrypto on passport_number_encrypted), travel_bookings. RLS. Indexes. | S9 |
| 20260727000000_seed_demo.sql | user_settings + demo_sessions tables. Full demo org seed. subscription_plans INSERT with confirmed ₹ pricing. Supabase Realtime publication for all tables. All wrapped in DO $$ IF NOT EXISTS guards — idempotent. | S10 |

### Migration File Rules

- Every file is idempotent — `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` before `CREATE POLICY`, `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- Never `ALTER` or `DROP` tables from a previous migration — write a new timestamped file instead
- RLS policies, indexes, and triggers for a table live in the **same file** as the table
- File header comment: migration name, date, what it creates, what it depends on
- Timestamps are sequential — never reuse, never reorder

---

## 8. Google Antigravity 2.0 Workflow

Antigravity writes migration files into `supabase/`, runs `supabase db push` from terminal, and verifies. Files appear in your folder and tables appear in Supabase — no SQL editor pasting needed unless CLI is unavailable.

### One-time Terminal Setup

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Initialise supabase/ folder in project root
npx supabase init

# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF
# Find ref: supabase.com → your project → Settings → General

# Verify connection
npx supabase db remote status
```

### Per-Sprint Workflow

1. **You prompt:** *"Read ARCHITECTURE.md, then read all files in supabase/migrations/, then write Sprint [X] migration for SwiftCall."*
2. **Antigravity reads:** ARCHITECTURE.md + existing .sql files. Full context before writing anything.
3. **Antigravity writes:** New .sql file in `supabase/migrations/` with correct timestamp. Appears in your folder immediately.
4. **Antigravity pushes:** Runs `npx supabase db push`. Or you manually copy-paste into Supabase SQL Editor.
5. **Antigravity verifies:** Checks terminal output for errors. Fixes + re-pushes if needed.
6. **You review:** Open Supabase Table Editor to confirm. Review SQL file in `supabase/` folder. Commit to git.

### Key CLI Commands

```bash
npx supabase db push          # apply pending migrations to remote Supabase
npx supabase db reset         # drop all + replay from scratch (local dev clean test)
npx supabase migration new x  # create empty migration with auto-timestamp
npx supabase migration list   # see which migrations have been applied
npx supabase db pull          # pull remote schema state for inspection
```

### Model Selection Inside Antigravity

| Task | Recommended model | Why |
|---|---|---|
| Writing migration SQL (complex schema) | Claude Opus 4.6 | Best production code quality for schema work |
| Writing Next.js / API routes | Claude Sonnet 4.6 or Gemini 3.5 Flash | Fast, good for standard patterns |
| Multi-agent orchestration | Gemini 3.5 Flash (default) | Fastest for tool-chain coordination |
| Architecture decisions | Claude Opus 4.6 | Deepest reasoning for complex tradeoffs |

> **Session start prompt:** Always begin with *"Read ARCHITECTURE.md, then read all files in supabase/migrations/, then [task]."* This gives Antigravity full context before touching any files.

> **Tip on model limits:** Antigravity's Gemini 3.5 Pro Eye has usage cooldowns for heavy sessions. Switch to Claude Opus 4.6 or Claude Sonnet 4.6 inside Antigravity when hitting limits — both are available natively.

---

## 9. RLS Strategy

RLS is the primary tenant isolation layer. Policies live in the same migration file as the table. Service role key bypasses RLS — server-side only in Next.js API routes.

### Standard Org-scoped Policy

```sql
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_org_isolation" ON public.contacts
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::UUID);
```

### Workspace-scoped Policy

```sql
CREATE POLICY "agents_workspace_isolation" ON public.ai_agents
  FOR ALL USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID AND (
      (auth.jwt() ->> 'role') IN ('org_admin', 'agency_admin')
      OR workspace_id = (auth.jwt() ->> 'workspace_id')::UUID
    )
  );
```

### Append-only Tables (audit, compliance, webhooks)

```sql
-- Tables: audit_logs, compliance_audit_logs, twilio_webhook_logs,
--         razorpay_webhook_logs, policy_remarks
-- INSERT + SELECT policies only. No UPDATE. No DELETE policies created.

CREATE OR REPLACE FUNCTION prevent_immutable_table_mutation()
RETURNS TRIGGER AS $$ BEGIN
  RAISE EXCEPTION 'Append-only table. No updates or deletes permitted.';
END; $$ LANGUAGE plpgsql;

-- Trigger applied to each append-only table in its own migration file.
```

### data_region Immutability

```sql
CREATE OR REPLACE FUNCTION prevent_data_region_change()
RETURNS TRIGGER AS $$ BEGIN
  IF OLD.data_region IS DISTINCT FROM NEW.data_region THEN
    RAISE EXCEPTION 'data_region is immutable after organization creation.';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_data_region
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION prevent_data_region_change();
```

### Agency Admin Cross-org Policy

```sql
CREATE POLICY "agency_admin_sees_own_orgs" ON public.organizations
  FOR SELECT USING (
    agency_id = (auth.jwt() ->> 'agency_id')::UUID
    AND (auth.jwt() ->> 'role') = 'agency_admin'
  );
```

---

## 10. Retell AI + Twilio Integration

### Call Flows

```
INBOUND CALL:
  Caller → Twilio number → POST /api/webhooks/twilio/voice
  → Lookup phone_numbers record → get retell_agent_id
  → Retell API: createPhoneCall({ agent_id, from, to })
  → Conversation runs (Retell handles LLM + STT + TTS)
  → POST /api/webhooks/retell/call-ended
  → INSERT calls row, trigger workflows, update analytics_daily

OUTBOUND CALL (campaign):
  Scheduler → DNC check → fetch next from campaign_contacts
  → Retell API: createPhoneCall({ agent_id, from_number, to_number })
  → POST /api/webhooks/retell/call-ended
  → UPDATE campaign_contacts, INSERT calls row
```

### Webhook Endpoints to Build

| Endpoint | From | Purpose |
|---|---|---|
| POST /api/webhooks/twilio/voice | Twilio | Return TwiML to connect call to Retell |
| POST /api/webhooks/twilio/status | Twilio | Call status updates (completed, no-answer, busy, failed) |
| POST /api/webhooks/retell/call-ended | Retell | Write calls row — transcript, duration, sentiment, cost |
| POST /api/webhooks/retell/call-analyzed | Retell | Post-call AI analysis and extracted data fields |

### retell_settings JSONB Structure

```json
{
  "retell_agent_id":           "agent_xxxxxxxx",
  "voice_id":                  "11labs-Adrian",
  "language":                  "en-US",
  "interruption_sensitivity":  0.8,
  "responsiveness":            0.8,
  "enable_backchannel":        true,
  "max_call_duration_ms":      600000,
  "end_call_after_silence_ms": 10000,
  "llm_websocket_url":         "wss://yourdomain.com/api/retell-llm/{agent_id}"
}
```

> **Security:** Verify Twilio `X-Twilio-Signature` and Retell HMAC on every request. Log raw payload to `twilio_webhook_logs` before processing. Reject unverified requests with 401.

---

## 11. Billing & Pricing — Razorpay

> All pricing confirmed from product screenshot. Razorpay confirmed as payment provider.

### Confirmed Pricing Tiers

| Plan | Price/mo | Agents | Key features | DB value |
|---|---|---|---|---|
| 🤝 Free | ₹0 | 1 | Basic Analytics, Community Support | price_monthly_micro = 0 |
| ⚡ Starter | ₹9,999 | 5 | Email Support, Advanced Analytics, Custom Greetings | price_monthly_micro = 9999000000 |
| ✨ Growth | ₹24,999 | Unlimited | Priority Support, IVR Builder, Audit Logs, API Access | price_monthly_micro = 24999000000 |
| 🛡️ Enterprise | Custom | Custom | Custom Minutes, Dedicated AM, SLA, On-premise | price_monthly_micro = 0 (quote) |

### Feature Gating by Plan

| Feature | Free | Starter | Growth | Enterprise |
|---|---|---|---|---|
| AI Agents | 1 | 5 | Unlimited | Custom |
| Analytics | Basic | Advanced | Advanced | Advanced |
| IVR Builder | ✗ | ✗ | ✓ | ✓ |
| Audit Logs | ✗ | ✗ | ✓ | ✓ |
| API Access | ✗ | ✗ | ✓ | ✓ |
| Custom Greetings | ✗ | ✓ | ✓ | ✓ |
| White-label portal | ✗ | ✗ | ✗ | ✓ (Future) |
| On-premise | ✗ | ✗ | ✗ | ✓ (Future) |
| Support | Community | Email | Priority | Dedicated AM + SLA |

### Razorpay Entity Mapping

| Razorpay entity | SwiftCall table + column |
|---|---|
| Customer | organizations.razorpay_customer_id + agencies.razorpay_customer_id |
| Plan | subscription_plans.razorpay_plan_id — fill after creating in Razorpay dashboard post S6 |
| Subscription | subscriptions.razorpay_subscription_id UNIQUE |
| Payment | invoices.razorpay_payment_id |
| Invoice | invoices.razorpay_invoice_id |
| Webhook event | razorpay_webhook_logs.razorpay_event_id UNIQUE (idempotency key) |

### Subscription Lifecycle

```
subscription.activated      → status = 'active'
subscription.charged        → status stays 'active' + INSERT invoices row
subscription.payment_failed → status = 'past_due'
subscription.cancelled      → status = 'cancelled'
subscription.paused         → status = 'paused'
subscription.resumed        → status = 'active'
```

### Webhook Handler Flow

```
POST /api/webhooks/razorpay
1. Verify HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET)
2. INSERT into razorpay_webhook_logs (idempotent via razorpay_event_id UNIQUE)
3. If already processed → return 200 immediately
4. Handle event type → update subscriptions / insert invoices
5. UPDATE razorpay_webhook_logs SET processed = true
6. Return 200
```

### Money Storage Rule

```sql
-- All money stored as INTEGER microcurrency (value × 1,000,000) + currency_code CHAR(3)
-- NEVER use DECIMAL or FLOAT for money — floating point errors corrupt financials
-- ₹9,999/mo → price_monthly_micro = 9999000000, currency_code = 'INR'
-- $29.99/mo → price_monthly_micro = 29990000, currency_code = 'USD'
-- Display: divide by 1,000,000 → format with Intl.NumberFormat

ADD CONSTRAINT chk_currency_code CHECK (currency_code ~ '^[A-Z]{3}$');
```

---

## 12. White-label & Agency Layer — Future Phase

> **Current status:** Schema ready. Infrastructure deferred. The `agencies` table and all white-label columns exist in migration 01 from day one. No agency rows are created in Phase 1.

### What Is Already in the Schema

- `agencies` table — fully defined with all white-label columns
- `organizations.agency_id` FK — nullable, no rows reference it in Phase 1
- `organizations.subdomain`, `custom_domain`, `branding_settings` — columns exist, null in Phase 1
- `agencies.razorpay_customer_id` — ready for when agencies are billed separately
- RLS policy for agency_admin cross-org visibility — written but no agency_admin users exist yet

### What Activating White-label Requires (Future Only)

| Action | Where | Cost |
|---|---|---|
| Upgrade Vercel to Pro | vercel.com → Settings → Billing | $20/mo |
| Add wildcard CNAME in Cloudflare | DNS: Name=*, Target=cname.vercel-dns.com, Proxy=OFF | Free |
| Add *.yourdomain.com in Vercel | Project → Settings → Domains | Included in Pro |
| Store VERCEL_API_TOKEN in .env.local | Vercel → Account Settings → Tokens | Free |
| Build agency portal UI | Antigravity writes the new pages | Dev time only |

### branding_settings JSONB Schema

```json
{
  "company_name":    "Acme BPO Solutions",
  "logo_url":        "https://[supabase-storage].../logo.png",
  "favicon_url":     "https://[supabase-storage].../favicon.ico",
  "primary_color":   "#2563eb",
  "secondary_color": "#1e40af",
  "font_family":     "Inter",
  "login_bg_url":    null,
  "support_email":   "support@acmebpo.com",
  "hide_powered_by": true
}
```

> **Upgrade trigger:** First agency client inquiry. Activate in one afternoon — no schema changes, no data migration. Infrastructure setup + Antigravity builds the agency portal UI.

---

## 13. Global Support

### Timestamps — UTC Always

```sql
-- All columns: TIMESTAMPTZ. Default: NOW() (UTC in Supabase/PostgreSQL)
-- User timezone in profiles.timezone — IANA string: 'Asia/Kolkata', 'America/New_York'
-- Frontend: Intl.DateTimeFormat with user timezone
-- Never store local time. Never use TIMESTAMP (without TZ).
```

### Phone Numbers — E.164

```sql
-- All phone columns named phone_e164. Format: +[country_code][number]
-- e.g. +919876543210 (India), +14155552671 (USA)
-- CHECK constraint: (phone_e164 ~ '^\+[1-9]\d{7,14}$')
```

### Money — Microcurrency

```sql
-- INTEGER microcurrency (value × 1,000,000) + currency_code CHAR(3)
-- ₹9,999 → 9999000000 INR · $29.99 → 29990000 USD
-- CHECK (currency_code ~ '^[A-Z]{3}$')
-- Display: divide by 1,000,000 → format with Intl.NumberFormat
```

### Country Codes + Data Region

```sql
-- country_code CHAR(2): CHECK (~ '^[A-Z]{2}$') — ISO 3166-1 alpha-2
-- e.g. 'IN', 'US', 'GB', 'AE', 'SG'
-- data_region: CHECK (IN ('in','us','eu','ap','me')) — immutable after org creation
-- Default data_region = 'in' for all orgs in Phase 1 (India-first)
```

---

## 14. Demo Account

> **⛔ The old "Protect and Seed Default Agents" SQL file is retired.** Demo agents are now seeded in migration 10 with `is_protected = true`. Do not run the old file.

### What `is_demo = true` Disables

| Feature | Demo org behavior |
|---|---|
| Razorpay billing | No customer created, no subscription, no invoices ever generated |
| Revenue analytics | Excluded from Super Admin platform revenue stats |
| Real calls | App logic blocks real Twilio/Retell calls for demo org |
| Org deletion | Trigger prevents deletion via UI |
| Seat limits | Not enforced — exempt from seat_assignments checks |
| Subscription gating | Middleware skips subscription check for is_demo orgs |

### Seed Block in Migration 10

```sql
-- testuser@example.com must exist in Supabase Auth BEFORE running migration 10
-- All wrapped in DO $$ IF NOT EXISTS guards — idempotent
-- 1. INSERT demo org (is_demo=true, isolation_level='shared', data_region='in')
-- 2. INSERT demo workspace
-- 3. Link testuser@example.com profile → demo org + workspace as org_admin
-- 4. INSERT 2 agents with is_protected=true, is_default=true
--    (replaces old name-based protection trigger)
-- 5. INSERT mock contacts, calls, campaigns
```

---

## 15. Frontend Catch-up Rule

> **Rule:** After all backend sprints (S1–S11) are complete, Antigravity audits every module. Any backend feature with no frontend UI gets a catch-up sprint. No backend feature ships without a user-facing interface.

### Modules Needing New UI in Catch-up Sprints

**Workspace Management UI**
Create/edit/delete workspaces. Manage workspace members. Assign roles. Invite users to workspace. *(Tables: workspaces, user_workspace_roles, invitations)*

**Org Settings + Billing Portal**
View current plan, usage breakdown per workspace, upgrade/downgrade flow, invoice history, seat management. Razorpay checkout integration. *(Tables: subscriptions, usage_records, invoices, seat_assignments)*

**Compliance Dashboard**
DNC list management (add/remove/import), consent records view, compliance audit log viewer, IRDAI/GDPR report export. *(Tables: dnc_list, consent_records, compliance_audit_logs)*

**Audit Log Viewer**
Read-only table of all user actions. Filter by user, action type, date range. Export to CSV. Only visible to org_admin. *(Table: audit_logs)*

**Telephony Settings**
View/manage purchased phone numbers. Assign numbers to agents. Configure recording settings, IVR, voicemail. Buy new numbers via Twilio API. *(Table: phone_numbers)*

**Insurance Pipeline UI**
Kanban pipeline view, contact detail with insurance-specific fields, policy management, claims tracker, renewal calendar. *(Tables: all insurance vertical tables)*

**Travel Pipeline UI**
Travel contact detail page, booking management, itinerary view, visa/document tracker. *(Tables: all travel vertical tables)*

**Super Admin Portal (admin.yourdomain.com)**
Platform overview dashboard, all orgs list, usage and revenue analytics (excluding demo), org impersonation, suspend/reactivate orgs. *(Service role views from S11 migration)*

**Onboarding Flow**
First-login wizard for new org admins — create first workspace, invite first user, connect first phone number, create first agent. Sets `onboarding_completed = true` on profiles.

### Modules Already Existing (Update Queries to New Schema Only)

- AI Agents list and configuration page
- Contacts / Leads list and detail
- Calls / Call History list and detail
- Campaigns list and management
- Knowledge Base upload and management
- Workflows builder
- Dashboard / Analytics overview
- Basic Settings page

> **Antigravity catch-up audit prompt:** *"Read ARCHITECTURE.md, read all migration files in supabase/migrations/, read all pages in src/app/. List every table that has no corresponding frontend page. Build the missing ones starting with [priority module]."*

---

## 16. Sprint Roadmap — Final

Backend sprints S1–S11. Frontend catch-up sprints FE1–FE3 after all backend done. White-label sprint F1 triggered by first agency client.

---

### S1 — Extensions, Enums, Agencies, Organizations
**Files:** `20260601000000_extensions_enums.sql` + `20260601000001_agencies_organizations.sql`

First time: `npx supabase init`, `npx supabase link`. Antigravity writes both files. Apply via CLI push or copy-paste in order. Extensions, all ENUMs, utility functions, agencies + organizations with all constraints, RLS, indexes, data_region immutability trigger.

---

### S2 — Workspaces, Users, Auth Hook
**File:** `20260608000000_workspaces_users_auth.sql`

workspaces, teams, profiles, user_workspace_roles, invitations. on_auth_user_created trigger. auth.custom_access_token_hook() function. RLS. Indexes.
**Manual step after push:** register hook in Supabase dashboard → Auth → Hooks.

---

### S3 — Domain Setup — Vercel Free
**No migration — infrastructure only**

Cloudflare DNS CNAME records for app + admin subdomains. Vercel projects for both domains. Antigravity builds Next.js tenant detection middleware and domain routing logic.

---

### S4 — Core Platform Tables
**File:** `20260615000000_core_platform.sql`

All Tier 3 tables (ai_agents through analytics_daily). sync_agent_stats(), auto_create_contact_from_call(), prevent_protected_agent_deletion() triggers. Full RLS (org + workspace scoped). All indexes. Supabase Realtime on key tables. **Largest migration file.**

---

### S5 — Telephony: Twilio + Retell AI
**File:** `20260622000000_telephony.sql`

phone_numbers, retell_agents, twilio_webhook_logs. Antigravity builds all four webhook API routes in parallel agents. Webhook signature verification. End-to-end inbound + outbound call test.

---

### S6 — Billing: Razorpay + Confirmed Pricing
**File:** `20260629000000_billing_razorpay.sql`

Billing tables + Razorpay webhook handler with HMAC verification + idempotency. Subscription status gating in Next.js middleware.
**Action after push:** Create Free / Starter / Growth plans in Razorpay dashboard → get `razorpay_plan_id` values → `UPDATE subscription_plans SET razorpay_plan_id = '...'`.

---

### S7 — Compliance
**File:** `20260706000000_compliance.sql`

dnc_list, consent_records, compliance_audit_logs, audit_logs. Append-only RLS + prevent_immutable_table_mutation() trigger on all four. DNC pre-flight check wired into outbound call initiation before Retell API call.

---

### S8 — Insurance Vertical
**File:** `20260713000000_insurance_vertical.sql`

All 9 insurance tables. policy_remarks append-only trigger. Org-scoped RLS. Indexes.

---

### S9 — Travel Vertical
**File:** `20260720000000_travel_vertical.sql`

travel_pipeline_stages, travel_contacts (pgcrypto on passport_number_encrypted), travel_bookings. RLS. Indexes.

---

### S10 — Seed + Final Verification
**File:** `20260727000000_seed_demo.sql`

user_settings + demo_sessions tables. Full demo org seed with confirmed ₹ pricing. Supabase Realtime publication for all tables.
**Verification:** Run `npx supabase db reset` → verify clean full replay of all 10 migrations with zero errors.

---

### S11 — Super Admin Portal
**File:** `20260803000000_super_admin_views.sql`

Platform-level views (service role only): platform_stats cross-org (excluding is_demo), org impersonation function (time-limited, audit-logged), suspension/reactivation procedures. Build admin.yourdomain.com as separate Next.js app.

---

### FE1 — Update Existing Frontend to New Schema
**No new migration — frontend queries updated**

Antigravity audits all existing pages. Updates every Supabase query to use new table names (contacts not leads), new column names (phone_e164 not phone_number), and new JWT auth pattern (org_id/workspace_id scoping). Agents, Contacts, Calls, Campaigns, KB, Workflows, Dashboard all updated.

---

### FE2 — Build UI for New Backend Modules
**No new migration — new frontend pages built**

Workspace management, org settings + billing portal (Razorpay checkout), compliance dashboard (DNC + consent + audit logs), telephony settings (phone numbers + IVR), onboarding wizard for new orgs.

---

### FE3 — Vertical UIs — Insurance + Travel
**No new migration — vertical frontend pages built**

Insurance: kanban pipeline, contact detail, policy management, claims tracker, renewal calendar. Travel: booking management, itinerary view, document tracker.

---

### F1 — White-label Activation *(Future — triggered by first agency client)*
**Infrastructure only — zero schema changes needed**

Upgrade Vercel to Pro. Add `*.yourdomain.com` wildcard CNAME in Cloudflare. Add `*.yourdomain.com` in Vercel project settings. Store VERCEL_API_TOKEN + VERCEL_PROJECT_ID in .env.local. Antigravity builds agency portal UI, subdomain routing middleware, custom domain add/verify API flow. Schema already waiting — no migrations needed.

---

## Final Open Items

| Item | Status | Blocks |
|---|---|---|
| All pricing tiers (₹0 / ₹9,999 / ₹24,999 / Custom) | ✅ Confirmed | Unblocked |
| Razorpay payment provider | ✅ Confirmed | Unblocked |
| Vercel Free deployment | ✅ Confirmed | Unblocked |
| Domain + Cloudflare DNS | ✅ Confirmed | Unblocked |
| Google Antigravity 2.0 | ✅ Confirmed | Unblocked |
| Supabase CLI migrations in supabase/ folder | ✅ Confirmed | Unblocked |
| Old schema.sql + protected agents SQL | ⛔ Retired | Never use again |
| Razorpay plan IDs (3 plans) | 🟡 Action after S6 | Create in Razorpay dashboard → fill razorpay_plan_id |
| Minute pricing per plan | 🟡 Decide before S6 | minutes_included + extra_minute_price_micro in subscription_plans |
| White-label infrastructure | 🟡 Deferred — F1 | First agency client triggers this |
| pgvector extension in Supabase | ⬜ Optional | Enable when KB embeddings needed |

---

*SwiftCall AI Architecture Plan v2.5 — May 2026 — Confidential*
*Next step: Start Sprint 1 — tell Antigravity to read this file and write the first two migration files.*
