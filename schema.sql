-- SwiftSocial AI CRM Database Schema
-- Create all tables for the AI call center CRM

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEMA REPAIR BLOCK
-- Ensures all tables have the correct columns if they already exist
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ 
BEGIN
    -- Fix LEADS (only if table exists)
    IF (to_regclass('public.leads') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='user_id') THEN
            ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Fix CAMPAIGNS (only if table exists)
    IF (to_regclass('public.campaigns') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='campaigns' AND column_name='user_id') THEN
            ALTER TABLE public.campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Fix MESSAGES (only if table exists)
    IF (to_regclass('public.messages') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='user_id') THEN
            ALTER TABLE public.messages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Fix WORKFLOWS (only if table exists)
    IF (to_regclass('public.workflows') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='workflows' AND column_name='user_id') THEN
            ALTER TABLE public.workflows ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Fix phone_number on LEADS
    IF (to_regclass('public.leads') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='phone_number') THEN
            ALTER TABLE public.leads ADD COLUMN phone_number TEXT DEFAULT '';
        END IF;
    END IF;

    -- Fix phone_number on CALLS
    IF (to_regclass('public.calls') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='calls' AND column_name='phone_number') THEN
            ALTER TABLE public.calls ADD COLUMN phone_number TEXT DEFAULT '';
        END IF;
    END IF;

    -- DATA REPAIR: Link existing data to the first user if user_id is missing
    -- This ensures your agents show up after adding the user_id column
    IF (to_regclass('public.ai_agents') IS NOT NULL) THEN
        UPDATE public.ai_agents SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    END IF;
    IF (to_regclass('public.leads') IS NOT NULL) THEN
        UPDATE public.leads SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    END IF;
    IF (to_regclass('public.calls') IS NOT NULL) THEN
        UPDATE public.calls SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    END IF;
END $$;

-- 1. PROFILES TABLE (User Profile Extension)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone_number TEXT,
  role TEXT DEFAULT 'user',
  company_id UUID,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI_AGENTS TABLE (AI Voice Agents)
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  languages TEXT[] DEFAULT ARRAY['English'],
  total_calls INTEGER DEFAULT 0,
  avg_duration INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  voice_settings JSONB DEFAULT '{}',
  script_template TEXT,
  -- Advanced Configuration (Sprint 1)
  goal_objective TEXT,
  success_criteria TEXT,
  post_call_action TEXT DEFAULT 'none' CHECK (post_call_action IN ('sms', 'email', 'webhook', 'none')),
  transfer_number TEXT,
  escalation_trigger TEXT,
  voicemail_detection BOOLEAN DEFAULT false,
  business_hours JSONB DEFAULT '{}',
  webhook_url TEXT,
  custom_variables JSONB DEFAULT '{}',
  fallback_message TEXT,
  max_silence_seconds INTEGER DEFAULT 10,
  max_call_duration INTEGER DEFAULT 600,
  agent_type TEXT DEFAULT 'both' CHECK (agent_type IN ('inbound', 'outbound', 'both')),
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CALLS TABLE (Individual Call Records)
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'transferred', 'failed', 'missed', 'ongoing')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  summary TEXT,
  recording_url TEXT,
  transcript TEXT,
  call_cost DECIMAL(10,2) DEFAULT 0.00,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANALYTICS_DAILY TABLE (Pre-aggregated Stats)
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  active_agents INTEGER DEFAULT 0,
  avg_handle_time INTEGER DEFAULT 0,
  cost_savings DECIMAL(10,2) DEFAULT 0.00,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  hourly_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 5. CALL_ISSUES TABLE (Top Call Issues Tracking)
CREATE TABLE IF NOT EXISTS public.call_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  month DATE NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, issue_type, month)
);

-- 6. KNOWLEDGE_BASE TABLE (Documents & URLs for AI Training)
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('document', 'url', 'folder', 'text')),
  file_size BIGINT,
  file_url TEXT,
  content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('indexed', 'syncing', 'pending', 'failed')),
  items_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BILLING TABLE (Usage & Billing)
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 100,
  current_month_usage INTEGER DEFAULT 0,
  billing_cycle_start DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. LEADS TABLE (CRM Contacts)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT NOT NULL,
  status TEXT DEFAULT 'Warm' CHECK (status IN ('Hot', 'Warm', 'Cold', 'Qualified', 'Lost')),
  source TEXT,
  tags TEXT[],
  last_contacted TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CAMPAIGNS TABLE (Outbound Call Groupings)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  total_leads INTEGER DEFAULT 0,
  completed_leads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MESSAGES TABLE (Unified Communication Center)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('sms', 'email')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WORKFLOWS TABLE (Workflow Engine Logic)
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  condition JSONB DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. USER_SETTINGS TABLE (Encrypted API Keys)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, key_name)
);

-- Create indexes for Sprint 2
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS for Sprint 2 tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Sprint 2
DROP POLICY IF EXISTS "Users can manage own leads" ON public.leads;
CREATE POLICY "Users can manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own messages" ON public.messages;
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own workflows" ON public.workflows;
CREATE POLICY "Users can manage own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Updated_at triggers for Sprint 2
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON public.workflows;
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON public.calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_user_date ON public.analytics_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_call_issues_user_month ON public.call_issues(user_id, month DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON public.knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON public.billing(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for AI_AGENTS
DROP POLICY IF EXISTS "Users can view own agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Users can insert own agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Users can update own agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Users can delete own agents" ON public.ai_agents;

CREATE POLICY "Users can view own agents" ON public.ai_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents" ON public.ai_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents" ON public.ai_agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents" ON public.ai_agents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for CALLS
DROP POLICY IF EXISTS "Users can view own calls" ON public.calls;
DROP POLICY IF EXISTS "Users can insert own calls" ON public.calls;
DROP POLICY IF EXISTS "Users can update own calls" ON public.calls;

CREATE POLICY "Users can view own calls" ON public.calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calls" ON public.calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls" ON public.calls
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ANALYTICS_DAILY
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_daily;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_daily;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.analytics_daily;

CREATE POLICY "Users can view own analytics" ON public.analytics_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.analytics_daily
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.analytics_daily
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for CALL_ISSUES
DROP POLICY IF EXISTS "Users can view own call issues" ON public.call_issues;
DROP POLICY IF EXISTS "Users can insert own call issues" ON public.call_issues;
DROP POLICY IF EXISTS "Users can update own call issues" ON public.call_issues;

CREATE POLICY "Users can view own call issues" ON public.call_issues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own call issues" ON public.call_issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own call issues" ON public.call_issues
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for KNOWLEDGE_BASE
DROP POLICY IF EXISTS "Users can view own knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can insert own knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can update own knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete own knowledge base" ON public.knowledge_base;

CREATE POLICY "Users can view own knowledge base" ON public.knowledge_base
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge base" ON public.knowledge_base
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge base" ON public.knowledge_base
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge base" ON public.knowledge_base
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for BILLING
DROP POLICY IF EXISTS "Users can view own billing" ON public.billing;
DROP POLICY IF EXISTS "Users can update own billing" ON public.billing;
DROP POLICY IF EXISTS "Users can insert own billing" ON public.billing;

CREATE POLICY "Users can view own billing" ON public.billing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own billing" ON public.billing
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing" ON public.billing
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_agents_updated_at ON public.ai_agents;
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_call_issues_updated_at ON public.call_issues;
CREATE TRIGGER update_call_issues_updated_at BEFORE UPDATE ON public.call_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_updated_at ON public.billing;
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-update ai_agents stats when a call is inserted or updated
-- This keeps total_calls, avg_duration, and success_rate always accurate
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_agent_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_total_calls INTEGER;
  v_avg_duration INTEGER;
  v_success_rate DECIMAL(5,2);
BEGIN
  -- Determine which agent_id to update
  IF TG_OP = 'DELETE' THEN
    v_agent_id := OLD.agent_id;
  ELSE
    v_agent_id := NEW.agent_id;
  END IF;

  IF v_agent_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Recompute stats for that agent
  SELECT
    COUNT(*),
    COALESCE(AVG(duration), 0)::INTEGER,
    CASE WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*)), 2)
      ELSE 0
    END
  INTO v_total_calls, v_avg_duration, v_success_rate
  FROM public.calls
  WHERE agent_id = v_agent_id;

  -- Update the agent row
  UPDATE public.ai_agents
  SET
    total_calls  = v_total_calls,
    avg_duration = v_avg_duration,
    success_rate = v_success_rate
  WHERE id = v_agent_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_agent_stats_on_call ON public.calls;
CREATE TRIGGER sync_agent_stats_on_call
  AFTER INSERT OR UPDATE OR DELETE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION sync_agent_stats();

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable Supabase Realtime on all tables (safe to re-run)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agents;      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;          EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_daily; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.call_issues;    EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.knowledge_base; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.billing;        EXCEPTION WHEN others THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create Lead from Call
-- If a call comes from a new phone number, create a lead record automatically
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_create_lead_from_call()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_exists BOOLEAN;
BEGIN
  -- Check if lead already exists for this user and phone number
  SELECT EXISTS (
    SELECT 1 FROM public.leads 
    WHERE user_id = NEW.user_id AND phone_number = NEW.phone_number
  ) INTO v_lead_exists;

  IF NOT v_lead_exists THEN
    INSERT INTO public.leads (user_id, full_name, phone_number, status, source)
    VALUES (NEW.user_id, 'New Lead (' || NEW.phone_number || ')', NEW.phone_number, 'Warm', 'AI Call');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_create_lead ON public.calls;
CREATE TRIGGER trg_auto_create_lead
  AFTER INSERT ON public.calls
  FOR EACH ROW EXECUTE FUNCTION auto_create_lead_from_call();

-- ─────────────────────────────────────────────────────────────────────────────
-- SPRINT 5 — Billing, Phone Numbers, Audit Log
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend billing table with Sprint 5 columns (safe to re-run)
DO $$ BEGIN
    IF (to_regclass('public.billing') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='plan_name') THEN
            ALTER TABLE public.billing ADD COLUMN plan_name TEXT DEFAULT 'starter';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='cycle') THEN
            ALTER TABLE public.billing ADD COLUMN cycle TEXT DEFAULT 'monthly';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='auto_topup') THEN
            ALTER TABLE public.billing ADD COLUMN auto_topup BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='auto_topup_threshold') THEN
            ALTER TABLE public.billing ADD COLUMN auto_topup_threshold INTEGER DEFAULT 100;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='auto_topup_amount') THEN
            ALTER TABLE public.billing ADD COLUMN auto_topup_amount INTEGER DEFAULT 500;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='trial_ends_at') THEN
            ALTER TABLE public.billing ADD COLUMN trial_ends_at TIMESTAMPTZ;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='razorpay_customer_id') THEN
            ALTER TABLE public.billing ADD COLUMN razorpay_customer_id TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing' AND column_name='razorpay_subscription_id') THEN
            ALTER TABLE public.billing ADD COLUMN razorpay_subscription_id TEXT;
        END IF;
    END IF;
END $$;

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  plan_name TEXT,
  description TEXT,
  razorpay_payment_id TEXT,
  invoice_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);

-- Phone Numbers table
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  friendly_name TEXT,
  provider TEXT DEFAULT 'twilio',
  provider_sid TEXT,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  is_recording_enabled BOOLEAN DEFAULT false,
  recording_retention_days INTEGER DEFAULT 30,
  voicemail_greeting_url TEXT,
  ivr_config JSONB DEFAULT '{}',
  caller_id_override TEXT,
  number_type TEXT DEFAULT 'local' CHECK (number_type IN ('local', 'toll-free', 'mobile', 'imported')),
  is_active BOOLEAN DEFAULT true,
  monthly_cost DECIMAL(10,2) DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own phone numbers" ON public.phone_numbers;
CREATE POLICY "Users can manage own phone numbers" ON public.phone_numbers FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON public.phone_numbers(user_id);
DROP TRIGGER IF EXISTS update_phone_numbers_updated_at ON public.phone_numbers;
CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON public.phone_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SPRINT 6: INSURANCE CRM (PHASE 2)
-- ─────────────────────────────────────────────────────────────────────────────

-- Insurance Pipeline Stages
CREATE TABLE IF NOT EXISTS public.insurance_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
ALTER TABLE public.insurance_pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own pipeline stages" ON public.insurance_pipeline_stages;
CREATE POLICY "Users can manage own pipeline stages" ON public.insurance_pipeline_stages FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_pipeline_stages_user_id ON public.insurance_pipeline_stages(user_id);
DROP TRIGGER IF EXISTS update_insurance_pipeline_stages_updated_at ON public.insurance_pipeline_stages;
CREATE TRIGGER update_insurance_pipeline_stages_updated_at BEFORE UPDATE ON public.insurance_pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insurance Contacts (1-to-1 with leads)
CREATE TABLE IF NOT EXISTS public.insurance_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  occupation TEXT,
  annual_income DECIMAL(12,2),
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  dependents INTEGER DEFAULT 0,
  is_smoker BOOLEAN DEFAULT false,
  pre_existing_conditions TEXT[],
  driving_record TEXT CHECK (driving_record IN ('Clean', 'Minor Violations', 'Major Violations')),
  property_type TEXT CHECK (property_type IN ('Own', 'Rent', 'None')),
  assigned_agent_id UUID, -- References internal user or agent
  notes TEXT,
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date TIMESTAMPTZ,
  pipeline_stage_id UUID REFERENCES public.insurance_pipeline_stages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id)
);
ALTER TABLE public.insurance_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own insurance contacts" ON public.insurance_contacts;
CREATE POLICY "Users can manage own insurance contacts" ON public.insurance_contacts FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_contacts_user_id ON public.insurance_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_contacts_lead_id ON public.insurance_contacts(lead_id);
DROP TRIGGER IF EXISTS update_insurance_contacts_updated_at ON public.insurance_contacts;
CREATE TRIGGER update_insurance_contacts_updated_at BEFORE UPDATE ON public.insurance_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insurance Policies (1-to-Many with insurance_contacts)
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insurance_contact_id UUID NOT NULL REFERENCES public.insurance_contacts(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  policy_type TEXT CHECK (policy_type IN ('Life', 'Auto', 'Home', 'Health', 'Commercial')),
  carrier_name TEXT,
  premium_amount DECIMAL(10,2) NOT NULL,
  premium_frequency TEXT CHECK (premium_frequency IN ('Monthly', 'Quarterly', 'Annual')),
  start_date DATE,
  end_date DATE,
  coverage_amount DECIMAL(12,2),
  deductible_amount DECIMAL(10,2),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Lapsed', 'Cancelled', 'Pending', 'Under Review')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own insurance policies" ON public.insurance_policies;
CREATE POLICY "Users can manage own insurance policies" ON public.insurance_policies FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON public.insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_contact_id ON public.insurance_policies(insurance_contact_id);
DROP TRIGGER IF EXISTS update_insurance_policies_updated_at ON public.insurance_policies;
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON public.insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insurance Claims (1-to-Many with insurance_policies)
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL,
  claim_type TEXT,
  claim_amount DECIMAL(10,2),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Settled', 'Rejected')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own insurance claims" ON public.insurance_claims;
CREATE POLICY "Users can manage own insurance claims" ON public.insurance_claims FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user_id ON public.insurance_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy_id ON public.insurance_claims(policy_id);
DROP TRIGGER IF EXISTS update_insurance_claims_updated_at ON public.insurance_claims;
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SPRINT 8: COMPLIANCE CENTER
-- ==========================================

-- Cleanup old tables if they exist to ensure schema integrity
DROP TABLE IF EXISTS public.compliance_audit_logs;
DROP TABLE IF EXISTS public.consent_records;
DROP TABLE IF EXISTS public.dnc_list;

-- DNC List (Do Not Call)
CREATE TABLE IF NOT EXISTS public.dnc_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  reason TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);
ALTER TABLE public.dnc_list ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own DNC list" ON public.dnc_list;
CREATE POLICY "Users can manage own DNC list" ON public.dnc_list FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_dnc_list_user_id ON public.dnc_list(user_id);
CREATE INDEX IF NOT EXISTS idx_dnc_list_phone ON public.dnc_list(phone_number);

-- Consent Records
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('opt-in', 'opt-out')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  recording_ref TEXT,
  expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own consent records" ON public.consent_records;
CREATE POLICY "Users can manage own consent records" ON public.consent_records FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_contact_id ON public.consent_records(contact_id);
DROP TRIGGER IF EXISTS update_consent_records_updated_at ON public.consent_records;
CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON public.consent_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Compliance Audit Logs
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES public.calls(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('call_blocked', 'consent_granted', 'consent_revoked', 'dnc_added', 'dnc_removed', 'irdai_check_failed')),
  status TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own compliance audit logs" ON public.compliance_audit_logs;
CREATE POLICY "Users can view own compliance audit logs" ON public.compliance_audit_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own compliance audit logs" ON public.compliance_audit_logs;
CREATE POLICY "Users can insert own compliance audit logs" ON public.compliance_audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_user_id ON public.compliance_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_call_id ON public.compliance_audit_logs(call_id);

-- SPRINT 8: MOCK COMPLIANCE DATA GENERATOR
-- Run this block AFTER creating the tables to automatically populate your compliance dashboards 
-- with mock audit logs and consent records linked to your existing tester account data.
DO $$
DECLARE
    contact_rec RECORD;
    call_rec RECORD;
BEGIN
    -- 1. Insert mock consent records for ALL existing contacts (leads)
    -- Since the tester account calls were all successful, it makes sense they all granted consent.
    FOR contact_rec IN SELECT id, user_id, phone_number FROM public.leads LOOP
        INSERT INTO public.consent_records (user_id, contact_id, type)
        VALUES (contact_rec.user_id, contact_rec.id, 'opt-in');
    END LOOP;

    -- 2. Insert mock audit logs for existing calls
    FOR call_rec IN SELECT id, user_id FROM public.calls LOOP
        -- Log: Consent Granted log for EVERY call (since they were successful)
        INSERT INTO public.compliance_audit_logs (user_id, event_type, status, details, call_id)
        VALUES (
            call_rec.user_id,
            'consent_granted',
            'success',
            '{"reason": "Verbal consent detected during introduction", "source": "AI Call Engine"}'::jsonb,
            call_rec.id
        );
    END LOOP;
END $$;

-- ==========================================
-- SPRINT 9: TRAVEL VERTICAL CRM
-- ==========================================

-- Travel Pipeline Stages
CREATE TABLE IF NOT EXISTS public.travel_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
ALTER TABLE public.travel_pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own travel pipeline stages" ON public.travel_pipeline_stages;
CREATE POLICY "Users can manage own travel pipeline stages" ON public.travel_pipeline_stages FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_travel_pipeline_stages_user_id ON public.travel_pipeline_stages(user_id);
DROP TRIGGER IF EXISTS update_travel_pipeline_stages_updated_at ON public.travel_pipeline_stages;
CREATE TRIGGER update_travel_pipeline_stages_updated_at BEFORE UPDATE ON public.travel_pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Travel Contacts
CREATE TABLE IF NOT EXISTS public.travel_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  preferred_destinations TEXT[],
  travel_type TEXT CHECK (travel_type IN ('Leisure', 'Business', 'Honeymoon', 'Adventure', 'Family', 'Group')),
  preferred_airlines TEXT[],
  seat_preference TEXT CHECK (seat_preference IN ('Window', 'Aisle', 'No Preference')),
  meal_preference TEXT,
  frequent_flyer_numbers JSONB DEFAULT '{}'::jsonb,
  hotel_tier_preference TEXT CHECK (hotel_tier_preference IN ('Budget', 'Mid-range', 'Luxury')),
  room_preference TEXT,
  date_of_birth DATE,
  passport_number_encrypted TEXT,
  passport_expiry_date DATE,
  nationality TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  travel_insurance_preference TEXT CHECK (travel_insurance_preference IN ('Yes', 'No', 'Has Own')),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  preferred_currency TEXT DEFAULT 'USD',
  payment_method_preference TEXT,
  assigned_agent_id UUID,
  notes TEXT,
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date TIMESTAMPTZ,
  pipeline_stage_id UUID REFERENCES public.travel_pipeline_stages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id)
);
ALTER TABLE public.travel_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own travel contacts" ON public.travel_contacts;
CREATE POLICY "Users can manage own travel contacts" ON public.travel_contacts FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_travel_contacts_user_id ON public.travel_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_contacts_lead_id ON public.travel_contacts(lead_id);
DROP TRIGGER IF EXISTS update_travel_contacts_updated_at ON public.travel_contacts;
CREATE TRIGGER update_travel_contacts_updated_at BEFORE UPDATE ON public.travel_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Travel Bookings
CREATE TABLE IF NOT EXISTS public.travel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  travel_contact_id UUID NOT NULL REFERENCES public.travel_contacts(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trip_type TEXT CHECK (trip_type IN ('Leisure', 'Business', 'Honeymoon', 'Adventure', 'Family', 'Group')),
  booking_value DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Cancelled', 'Completed')),
  assigned_agent_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own travel bookings" ON public.travel_bookings;
CREATE POLICY "Users can manage own travel bookings" ON public.travel_bookings FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_user_id ON public.travel_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_contact_id ON public.travel_bookings(travel_contact_id);
DROP TRIGGER IF EXISTS update_travel_bookings_updated_at ON public.travel_bookings;
CREATE TRIGGER update_travel_bookings_updated_at BEFORE UPDATE ON public.travel_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SPRINT 11: Travel Compliance Updates
ALTER TABLE public.compliance_audit_logs DROP CONSTRAINT IF EXISTS compliance_audit_logs_event_type_check;
ALTER TABLE public.compliance_audit_logs ADD CONSTRAINT compliance_audit_logs_event_type_check CHECK (event_type IN ('call_blocked', 'consent_granted', 'consent_revoked', 'dnc_added', 'dnc_removed', 'irdai_check_failed', 'passport_decrypted'));

-- SPRINT 12 — Schema Extensions & Data Model (PHASE 4)

-- Relationship Executives Table
CREATE TABLE IF NOT EXISTS public.relationship_executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  area TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.relationship_executives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own REs" ON public.relationship_executives;
CREATE POLICY "Users can manage own REs" ON public.relationship_executives FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_executives_user_id ON public.relationship_executives(user_id);
DROP TRIGGER IF EXISTS update_relationship_executives_updated_at ON public.relationship_executives;
CREATE TRIGGER update_relationship_executives_updated_at BEFORE UPDATE ON public.relationship_executives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Intermediary Masters Table
CREATE TABLE IF NOT EXISTS public.intermediary_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT CHECK (type IN ('Agent', 'Broker', 'Bank', 'Direct', 'Online', 'Other')),
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.intermediary_masters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own intermediaries" ON public.intermediary_masters;
CREATE POLICY "Users can manage own intermediaries" ON public.intermediary_masters FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_intermediary_masters_user_id ON public.intermediary_masters(user_id);
DROP TRIGGER IF EXISTS update_intermediary_masters_updated_at ON public.intermediary_masters;
CREATE TRIGGER update_intermediary_masters_updated_at BEFORE UPDATE ON public.intermediary_masters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insurance Groups Table
CREATE TABLE IF NOT EXISTS public.insurance_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  contact_person TEXT,
  contact_no TEXT,
  email TEXT,
  address TEXT,
  area TEXT,
  re_id UUID REFERENCES public.relationship_executives(id) ON DELETE SET NULL,
  intermediary_id UUID REFERENCES public.intermediary_masters(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.insurance_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own insurance groups" ON public.insurance_groups;
CREATE POLICY "Users can manage own insurance groups" ON public.insurance_groups FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_groups_user_id ON public.insurance_groups(user_id);
DROP TRIGGER IF EXISTS update_insurance_groups_updated_at ON public.insurance_groups;
CREATE TRIGGER update_insurance_groups_updated_at BEFORE UPDATE ON public.insurance_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insurance Group Members Table
CREATE TABLE IF NOT EXISTS public.insurance_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.insurance_groups(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  relationship TEXT,       -- Self, Spouse, Son, Daughter, Father, Mother, Other
  dob DATE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, lead_id)
);
ALTER TABLE public.insurance_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own group members" ON public.insurance_group_members;
CREATE POLICY "Users can manage own group members" ON public.insurance_group_members FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_group_members_group_id ON public.insurance_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_insurance_group_members_lead_id ON public.insurance_group_members(lead_id);

-- Policy Remarks Table
CREATE TABLE IF NOT EXISTS public.policy_remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
  remark TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.policy_remarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own policy remarks" ON public.policy_remarks;
CREATE POLICY "Users can manage own policy remarks" ON public.policy_remarks FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_policy_remarks_policy_id ON public.policy_remarks(policy_id);

-- ─── EXTEND insurance_policies and insurance_contacts ───
DO $$ 
BEGIN
    -- insurance_policies extensions
    IF (to_regclass('public.insurance_policies') IS NOT NULL) THEN
        -- Standard fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='sub_product') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN sub_product TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='term') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN term TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='ppt') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN ppt TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='business_type') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN business_type TEXT DEFAULT 'Normal';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='gross_premium') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN gross_premium DECIMAL(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='endorsement_amount') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN endorsement_amount DECIMAL(10,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='renewal_preference') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN renewal_preference TEXT CHECK (renewal_preference IN ('Auto', 'Manual', 'Do Not Renew'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='renewal_status') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN renewal_status TEXT CHECK (renewal_status IN ('Upcoming', 'Missed', 'Retained'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='call_status') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN call_status TEXT DEFAULT 'Pending' CHECK (call_status IN ('Pending', 'Called', 'Not Reachable', 'Interested', 'Not Interested', 'Callback Scheduled'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='doc') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN doc DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='fup') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN fup DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='registration_no') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN registration_no TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='vehicle_details') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN vehicle_details JSONB DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='risk_details') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN risk_details JSONB DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='area') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN area TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='remarks') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN remarks TEXT;
        END IF;
        
        -- Foreign Keys
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='intermediary_id') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN intermediary_id UUID REFERENCES public.intermediary_masters(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='re_id') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN re_id UUID REFERENCES public.relationship_executives(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_policies' AND column_name='group_id') THEN
            ALTER TABLE public.insurance_policies ADD COLUMN group_id UUID REFERENCES public.insurance_groups(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- insurance_contacts extensions
    IF (to_regclass('public.insurance_contacts') IS NOT NULL) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_contacts' AND column_name='area') THEN
            ALTER TABLE public.insurance_contacts ADD COLUMN area TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_contacts' AND column_name='re_id') THEN
            ALTER TABLE public.insurance_contacts ADD COLUMN re_id UUID REFERENCES public.relationship_executives(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_contacts' AND column_name='group_id') THEN
            ALTER TABLE public.insurance_contacts ADD COLUMN group_id UUID REFERENCES public.insurance_groups(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

