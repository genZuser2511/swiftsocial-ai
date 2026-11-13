const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Component and Route replacements
    content = content.replace(/fetchLeads/g, 'fetchContacts');
    content = content.replace(/addLead/g, 'addContact');
    content = content.replace(/updateLead/g, 'updateContact');
    content = content.replace(/deleteLead/g, 'deleteContact');
    
    content = content.replace(/leads\.length/g, 'contacts.length');
    content = content.replace(/leads\.filter/g, 'contacts.filter');
    content = content.replace(/leads\.map/g, 'contacts.map');
    content = content.replace(/leads\.find/g, 'contacts.find');
    content = content.replace(/const \{ leads,/g, 'const { contacts,');
    content = content.replace(/const \{ leads \}/g, 'const { contacts }');
    content = content.replace(/, leads/g, ', contacts');
    content = content.replace(/leads,/g, 'contacts,');
    content = content.replace(/leads =/g, 'contacts =');
    content = content.replace(/filteredLeads/g, 'filteredContacts');
    content = content.replace(/exportLeads/g, 'exportContacts');
    content = content.replace(/selectedLead/g, 'selectedContact');
    content = content.replace(/leadId/g, 'contactId');
    content = content.replace(/lead\./g, 'contact.');
    content = content.replace(/\(lead\)/g, '(contact)');
    content = content.replace(/lead =>/g, 'contact =>');
    
    // UI Text replacements
    content = content.replace(/Total Leads/g, 'Total Contacts');
    content = content.replace(/>Leads</g, '>Contacts<');
    content = content.replace(/LeadsPage/g, 'ContactsPage');
    content = content.replace(/\/dashboard\/leads/g, '/dashboard/contacts');
    
    // Campaign property replacements
    content = content.replace(/totalLeads/g, 'totalContacts');
    content = content.replace(/completedLeads/g, 'completedContacts');
    
    // Phone number field
    content = content.replace(/phone_number/g, 'phone_e164');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
});
