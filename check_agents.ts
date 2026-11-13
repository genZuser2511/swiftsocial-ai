import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddbetcpuxcqmmjkjzut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZGJldGNwdXhjcW1tamtqenV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA1NDQyOSwiZXhwIjoyMDg1NjMwNDI5fQ.jmthROrZ5BUjC2jCiTtcEXkKvRDE_1BA_Gq-ZhOUQhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Checking AI Agents...");
    const { data: agents, error } = await supabase.from('ai_agents').select('id, name, org_id, user_id, status');
    if (error) {
        console.error("Error fetching agents:", error);
    } else {
        console.log("Found", agents.length, "agents:");
        console.table(agents);
    }

    console.log("Checking Profiles...");
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, email, org_id');
    if (pError) {
        console.error("Error fetching profiles:", pError);
    } else {
        console.table(profiles);
    }
}

main();
