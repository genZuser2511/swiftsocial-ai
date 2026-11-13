# SwiftSocial.AI Master Plan (1st Doc)

This document contains the entire project roadmap and all planned features for SwiftSocial.AI.

## Deployment Protocol
**Strict Rule:** All code changes must be explicitly confirmed and approved by the user before they are pushed or deployed to Vercel.

## Phase 1: Foundation (Completed)
- [x] **Sprint 1-4**: Core Dashboard, AI Agent Infrastructure, and Lead Management.
- [x] **Sprint 5**: CRM Vertical & Insurance Pipeline.
- [x] **Sprint 6**: Billing Module (Mock Razorpay) & Settings Restructuring.
- [x] **Sprint 7**: Real-time Call Logs & Agent Training Interface.

## Phase 2: Compliance & Intelligence (Completed)
- [x] **Sprint 8: Compliance Center**
    - Immutable Audit Logs.
    - DNC Registry Management.
    - Consent Tracking System.
    - Reporting & PDF Exports.
- [x] **Sprint 9: AI Knowledge Base & Document Processing**
    - PDF/Doc upload and parsing.
    - Vector database integration for AI context.
    - Real-time knowledge retrieval during calls.

## Phase 3: Travel Vertical (Completed)
- [x] **Sprint 9: Travel CRM**
    - Travel contacts with AES-256 encrypted passport data.
    - Travel pipeline board (New Inquiry to Post-Trip).
    - Travel Dashboard (KPIs, Charts, Alerts).
- [x] **Sprint 10: Travel AI Agent Templates + Workflows**
    - 6 new travel-specific agent templates (Inbound, Follow-up, Pre-Departure, etc.).
    - 5 new travel-specific workflow templates.
- [x] **Sprint 11: Travel Analytics + Compliance**
    - Booking, Destination, and Agent Performance analytics.
    - Travel Compliance (Passport decryption UI, Consent, DNC, Retention).

## Phase 4: Insurance Field Parity (Ongoing)
- [x] **Sprint 12: Schema Extensions & Data Model (Database Restructure)**
    - Advanced insurance fields (sub-product, PPT, premium breakdown).
    - Groups & Members data model.
    - RE & Intermediary management.
- [ ] **Sprint 13: Renewal Report Module**
    - High-performance renewal dashboard with advanced filters.
    - KPI bars and sticky-column listing table.
    - Inline call status and remarks management.
- [ ] **Sprint 14: Supporting Modules**
    - Renewal Snapshot & Calendar.
    - Group Detail management.
    - RE & Intermediary master pages.

## Phase 5: Frontend Catch-up (Completed)
- [x] **Sprint FE1: Codebase Refactoring**
    - Refactored existing codebase to align with the new multi-tenant Supabase schema.
- [x] **Sprint FE2: UI for Backend Modules S1-S10**
    - Settings & Workspace Management (Central hub, switcher, invites).
    - Billing & Subscriptions (Routing ready for live Razorpay).
    - Compliance & Security Dashboard (Audit logs, Consent, DNC).
    - Telephony & Providers (Twilio keys, phone numbers).
- [x] **Sprint FE3: Super Admin & Onboarding Catch-up**
    - Onboarding Flow (Org & Workspace creation).
    - Super Admin Portal (Global aggregation stats via service-role).

## Phase 5.5: Backend Migration & Debugging (Completed)
- [x] **Sprint DB1: Schema Migration & JWT Auth Fixes**
    - Pushed new restructured schema to new Supabase remote instance.
    - Resolved `401 Unauthorized` API crashes by updating custom JWT hook to use `app_role` instead of reserved `role` claim.
    - Manually provisioned `testuser` account, bypassing restricted `auth.users` trigger for demo continuity.
- [x] **Sprint DB2: Agent & Data Restoration**
    - Migrated old database agents (Inbound & Outbound) and historical calls to new strictly typed schema.
    - Recalculated `avg_duration`, `success_rate`, and `total_calls` aggregations.
    - Fixed Framer Motion staggered animation bug in Dashboard causing dynamically loaded agents to render invisibly.

## Phase 6: Advanced Integrations (Future)
- [ ] **Sprint 15: Multi-Channel Communication**
    - SMS/WhatsApp integration.
    - Email campaign automation.
- [ ] **Sprint 16: Team & Collaboration**
    - Multi-user roles & permissions.
    - Team performance analytics.

## Phase 7: Productionization (Future)
- [ ] **Sprint 17: Live API Migrations**
    - Replace mock call API with Retell AI/Twilio.
    - Replace mock billing with live Razorpay webhooks.
    - Production-grade audio processing pipeline.

*(Update this roadmap when new major features are introduced)*
