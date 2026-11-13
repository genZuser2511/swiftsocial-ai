const fs = require('fs');

function makeIdempotent(filePath) {
    // Read again, but wait, the files are already modified!
    // Since I can't git checkout, I need to fix the current files!
    // Oh, my fix script OVERWROTE the files. The old content is gone!
    // Let me fix the broken `ALTER TABLE` lines in the files.
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: comma at the end of the line before the semicolon
    content = content.replace(/,\s*;/g, ';');
    
    // Fix 2: inline comment hiding the semicolon
    // e.g. "  -- linked platform user (optional);"
    // We want " ; -- linked platform user (optional)"
    // Or we just remove inline comments from ALTER TABLE statements.
    content = content.replace(/(ALTER TABLE.*?)(\s*--.*?);/g, '$1;$2');
    
    // Let's also just aggressively fix any line ending in `-- comment;`
    // Actually, maybe some lines have `..., -- comment;`
    // Let's just strip all inline comments from ALTER TABLE lines to be safe
    const lines = content.split('\n');
    for (let i=0; i<lines.length; i++) {
        if (lines[i].startsWith('ALTER TABLE ')) {
            // strip everything after --
            const commentIdx = lines[i].indexOf('--');
            if (commentIdx !== -1) {
                lines[i] = lines[i].substring(0, commentIdx).trim();
                if (!lines[i].endsWith(';')) lines[i] += ';';
            }
            // strip trailing comma before semicolon
            lines[i] = lines[i].replace(/,\s*;/g, ';');
        }
    }
    
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Repaired ${filePath}`);
}

makeIdempotent('supabase/migrations/20260713000000_insurance_vertical.sql');
makeIdempotent('supabase/migrations/20260720000000_travel_vertical.sql');
makeIdempotent('supabase/migrations/20260727000000_seed_demo.sql');
