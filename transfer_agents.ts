import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddbetcpuxcqmmjkjzut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZGJldGNwdXhjcW1tamtqenV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA1NDQyOSwiZXhwIjoyMDg1NjMwNDI5fQ.jmthROrZ5BUjC2jCiTtcEXkKvRDE_1BA_Gq-ZhOUQhY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // 1. Find the test agency organization
    const { data: orgs } = await supabase.from('organizations').select('id, name').eq('name', 'test agency');
    let targetOrgId = null;
    let targetWorkspaceId = null;
    
    if (orgs && orgs.length > 0) {
        targetOrgId = orgs[0].id;
        console.log('Found org:', orgs[0]);
    } else {
        // Fallback to getting whatever org the user "Tester" is attached to.
        const { data: profiles } = await supabase.from('profiles').select('org_id').eq('full_name', 'Tester').single();
        if (profiles && profiles.org_id) {
            targetOrgId = profiles.org_id;
            console.log('Found org via profile:', profiles.org_id);
        }
    }

    if (!targetOrgId) {
        console.error('Could not find target org!');
        return;
    }

    // Get a workspace for this org
    const { data: workspaces } = await supabase.from('workspaces').select('id').eq('org_id', targetOrgId).limit(1);
    if (workspaces && workspaces.length > 0) {
        targetWorkspaceId = workspaces[0].id;
    }

    // 2. Transfer the agents
    const agentsToTransfer = ['Inbound call agent', 'Outbound call agent'];
    
    for (const agentName of agentsToTransfer) {
        const { error } = await supabase.from('ai_agents')
            .update({ org_id: targetOrgId, workspace_id: targetWorkspaceId })
            .eq('name', agentName);
            
        if (error) console.error(`Error updating agent ${agentName}:`, error);
        else console.log(`Transferred agent ${agentName} to org ${targetOrgId}`);
    }

    // 3. Transfer the calls associated with those agents
    const { data: agents } = await supabase.from('ai_agents').select('id').in('name', agentsToTransfer);
    if (agents && agents.length > 0) {
        const agentIds = agents.map(a => a.id);
        const { error: callsError } = await supabase.from('calls')
            .update({ org_id: targetOrgId, workspace_id: targetWorkspaceId })
            .in('agent_id', agentIds);
            
        if (callsError) console.error('Error updating calls:', callsError);
        else console.log('Transferred associated calls to org', targetOrgId);
    }
}
run();
