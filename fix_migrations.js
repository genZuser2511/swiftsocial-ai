const fs = require('fs');

function makeIdempotent(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find all CREATE TABLE IF NOT EXISTS blocks
    const tableRegex = /CREATE TABLE IF NOT EXISTS public\.([a-z0-9_]+)\s*\(([\s\S]*?)\);/g;
    
    content = content.replace(tableRegex, (match, tableName, columnsBlock) => {
        // Split columns by comma (rough approximation, assuming no commas in constraints for now, wait constraints have commas)
        // Let's just output CREATE TABLE IF NOT EXISTS public.tableName (id UUID ...);
        // Then we extract all lines
        const lines = columnsBlock.split('\n');
        
        let alterTables = [];
        let doBlocks = [];
        let idLine = '  id UUID PRIMARY KEY DEFAULT gen_random_uuid()';
        
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('--')) continue;
            if (line.startsWith('id ')) {
                idLine = line.replace(/,$/, '');
                continue;
            }
            if (line.startsWith('CONSTRAINT') || line.startsWith('UNIQUE')) {
                let constraint = line.replace(/,$/, '');
                doBlocks.push(`DO $$ BEGIN\n  ALTER TABLE public.${tableName} ADD ${constraint};\nEXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;`);
                continue;
            }
            
            // It's a column
            let colDef = line.replace(/,$/, '');
            // some check constraints might be inline e.g. "type TEXT NOT NULL CHECK (...)"
            alterTables.push(`ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${colDef};`);
        }
        
        return `CREATE TABLE IF NOT EXISTS public.${tableName} (\n${idLine}\n);\n\n` + alterTables.join('\n') + '\n\n' + doBlocks.join('\n\n');
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

makeIdempotent('supabase/migrations/20260713000000_insurance_vertical.sql');
makeIdempotent('supabase/migrations/20260720000000_travel_vertical.sql');
makeIdempotent('supabase/migrations/20260727000000_seed_demo.sql');
