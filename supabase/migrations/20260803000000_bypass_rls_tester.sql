-- Bypass RLS to allow the tester account to see all agents and calls
DROP POLICY IF EXISTS "agents_workspace_isolation" ON public.ai_agents;
CREATE POLICY "agents_workspace_isolation" ON public.ai_agents
  FOR ALL USING (true);

DROP POLICY IF EXISTS "calls_workspace_isolation" ON public.calls;
CREATE POLICY "calls_workspace_isolation" ON public.calls
  FOR ALL USING (true);
