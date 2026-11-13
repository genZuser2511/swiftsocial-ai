import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddbetcpuxcqmmjkjzut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZGJldGNwdXhjcW1tamtqenV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA1NDQyOSwiZXhwIjoyMDg1NjMwNDI5fQ.jmthROrZ5BUjC2jCiTtcEXkKvRDE_1BA_Gq-ZhOUQhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // 1. Try a query using the testuser's JWT instead of service role!
    // But we don't have the password.
    // Instead, let's just log into the user if we can? We can't without password.
    // Let's create an RPC to check the jwt claims or run the query as the user.
    
    // Instead, let's check if the agents are present when we fetch as service role.
    const { data: agents, error } = await supabase.from('ai_agents').select('*').eq('org_id', '00000000-0000-0000-0000-000000000001');
    console.log("Agents:", agents?.map(a => a.name));
}

main();
