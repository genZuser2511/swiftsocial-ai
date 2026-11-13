const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jqgtvretwasrrjetgrvw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ3R2cmV0d2FzcnJqZXRncnZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxNDIxMiwiZXhwIjoyMDk1OTkwMjEyfQ.pWoPtDOHozD5FpR4wHAm8Ulkj99jU58J8xnpWZoptzE'
);

async function fix() {
    const { data: users, error: uError } = await supabase.auth.admin.listUsers();
    const testuser = users.users.find(u => u.email === 'testuser@example.com');
    if (!testuser) {
        console.log("No testuser");
        return;
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', testuser.id).single();
    if (!profile) {
        console.log("No profile");
        return;
    }

    console.log("User org_id:", profile.org_id);
    console.log("User workspace_id:", profile.default_workspace_id);

    // Update agents
    const { error: aError } = await supabase.from('ai_agents')
        .update({ org_id: profile.org_id, workspace_id: profile.default_workspace_id })
        .in('name', ['Inbound call agent', 'Outbound call agent']);
        
    if (aError) console.error("Agent update error:", aError);
    else console.log("Agents updated");

    // Update calls
    const { data: agents } = await supabase.from('ai_agents').select('id').in('name', ['Inbound call agent', 'Outbound call agent']);
    if (agents && agents.length > 0) {
        const agentIds = agents.map(a => a.id);
        const { error: cError } = await supabase.from('calls')
            .update({ org_id: profile.org_id, workspace_id: profile.default_workspace_id })
            .in('agent_id', agentIds);
        if (cError) console.error("Calls update error:", cError);
        else console.log("Calls updated");
    }
}
fix();
