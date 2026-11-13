const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'store', 'useAgentStore.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Types
content = content.replace(/export type Lead =/g, 'export type Contact =');
content = content.replace(/leadId/g, 'contactId');
content = content.replace(/lead_id/g, 'contact_id');
content = content.replace(/totalLeads/g, 'totalContacts');
content = content.replace(/total_leads/g, 'total_contacts');
content = content.replace(/completedLeads/g, 'completedContacts');
content = content.replace(/completed_leads/g, 'completed_contacts');

// State names
content = content.replace(/leads: Lead\[\]/g, 'contacts: Contact[]');
content = content.replace(/leads:/g, 'contacts:');
content = content.replace(/fetchLeads/g, 'fetchContacts');
content = content.replace(/addLead/g, 'addContact');
content = content.replace(/updateLead/g, 'updateContact');
content = content.replace(/deleteLead/g, 'deleteContact');

// Supabase queries
content = content.replace(/'leads'/g, "'contacts'");
content = content.replace(/\.eq\('user_id', userData\.user\.id\)/g, ""); // Remove user_id filter since RLS handles it
content = content.replace(/user_id: userData\.user\.id/g, 'created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id');

// Columns
content = content.replace(/phone_number/g, 'phone_e164');
content = content.replace(/cost_savings/g, 'call_cost_micro');
content = content.replace(/phone:/g, 'phone:'); // unchanged in TS type, but DB column changed

fs.writeFileSync(filePath, content);
console.log('Successfully updated useAgentStore.ts');
