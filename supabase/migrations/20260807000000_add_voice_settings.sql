ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS voice_settings JSONB NOT NULL DEFAULT '{}';
