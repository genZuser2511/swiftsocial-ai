-- SwiftSocial AI CRM Database Schema
-- Create all tables for the AI call center CRM

-- 1. PROFILES TABLE (User Profile Extension)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone_number TEXT,
  role TEXT DEFAULT 'user',
  company_id UUID,
  avatar_url TEXT,
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
