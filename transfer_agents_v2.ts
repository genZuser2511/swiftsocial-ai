import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddbetcpuxcqmmjkjzut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZGJldGNwdXhjcW1tamtqenV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA1NDQyOSwiZXhwIjoyMDg1NjMwNDI5fQ.jmthROrZ5BUjC2jCiTtcEXkKvRDE_1BA_Gq-ZhOUQhY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // 1. Fetch ALL orgs, agencies, and profiles to see what we have
    const { data: orgs } = await supabase.from('organizations').select('id, name');
    const { data: agencies } = await supabase.from('agencies').select('id, name');
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, org_id, workspace_id:default_workspace_id');

    console.log('Orgs:', orgs);
    console.log('Agencies:', agencies);
    console.log('Profiles:', profiles);

    let targetOrgId = null;
    let targetWorkspaceId = null;

    // Try to find the Tester profile
    const testerProfile = profiles?.find(p => p.full_name?.toLowerCase().includes('tester'));
    if (testerProfile && testerProfile.org_id) {
        targetOrgId = testerProfile.org_id;
        targetWorkspaceId = testerProfile.workspace_id;
    } else if (orgs && orgs.length > 0) {
        // Fallback to the first org we find
        const testOrg = orgs.find(o => o.name.toLowerCase().includes('test')) || orgs[0];
        targetOrgId = testOrg.id;
        const { data: ws } = await supabase.from('workspaces').select('id').eq('org_id', targetOrgId).limit(1);
        if (ws && ws.length > 0) targetWorkspaceId = ws[0].id;
    }

    if (!targetOrgId) {
        console.error('STILL COULD NOT FIND AN ORG ID!');
        return;
    }

    console.log(`Will transfer to Org: ${targetOrgId} | Workspace: ${targetWorkspaceId}`);

    // Transfer agents
    const agentsToTransfer = ['Inbound call agent', 'Outbound call agent'];
    
    for (const agentName of agentsToTransfer) {
        const { error } = await supabase.from('ai_agents')
            .update({ org_id: targetOrgId, workspace_id: targetWorkspaceId })
            .eq('name', agentName);
            
        if (error) console.error(`Error updating agent ${agentName}:`, error);
        else console.log(`Transferred agent ${agentName}`);
    }

    // Transfer calls
    const { data: agents } = await supabase.from('ai_agents').select('id').in('name', agentsToTransfer);
    if (agents && agents.length > 0) {
        const agentIds = agents.map(a => a.id);
        const { error: callsError } = await supabase.from('calls')
            .update({ org_id: targetOrgId, workspace_id: targetWorkspaceId })
            .in('agent_id', agentIds);
            
        if (callsError) console.error('Error updating calls:', callsError);
        else console.log('Transferred associated calls');
    }
}
run();
