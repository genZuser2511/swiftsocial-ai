import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddbetcpuxcqmmjkjzut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZGJldGNwdXhjcW1tamtqenV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA1NDQyOSwiZXhwIjoyMDg1NjMwNDI5fQ.jmthROrZ5BUjC2jCiTtcEXkKvRDE_1BA_Gq-ZhOUQhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Checking RLS Policies on ai_agents...");
    const { data: policies, error } = await supabase.rpc('get_policies');
    // Supabase JS doesn't easily expose raw SQL for fetching pg_policies without a custom RPC.
    // Let's use the postgres endpoint via REST or just write a small query.
}

main();
