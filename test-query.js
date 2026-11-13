const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktdzshckntwtnmsyoxle.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '...'; // I will get it from .env.local

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    console.log("Testing ai_agents query...");
    const { data, error } = await supabase.from('ai_agents').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("ai_agents error:", error);
    } else {
        console.log("ai_agents data length:", data.length);
    }
}
test();
