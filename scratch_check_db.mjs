import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('--- PROFILES ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, email');
  console.log(pErr ? 'Error fetching profiles:' + pErr.message : profiles);

  console.log('\n--- AGENTS ---');
  const { data: agents, error: aErr } = await supabase.from('ai_agents').select('id, name, user_id');
  console.log(aErr ? 'Error fetching agents:' + aErr.message : agents);

  console.log('\n--- CALLS ---');
  const { data: calls, error: cErr } = await supabase.from('calls').select('id, user_id, status').limit(5);
  console.log(cErr ? 'Error fetching calls:' + cErr.message : calls);
}

check();
