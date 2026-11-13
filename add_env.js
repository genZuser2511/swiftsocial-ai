const { spawn } = require('child_process');

async function addEnv(key, value) {
    const envs = ['production'];
    for (const env of envs) {
        await new Promise((resolve, reject) => {
            console.log(`Adding ${key} to ${env}...`);
            const child = spawn('npx.cmd', ['vercel', 'env', 'add', key, env, '--yes'], {
                stdio: ['pipe', 'inherit', 'inherit'],
                shell: true
            });
            
            child.stdin.write(value + '\n');
            child.stdin.end();

            child.on('close', (code) => {
                // Ignore code 1 since it might mean "already exists"
                resolve();
            });
        });
    }
}

async function run() {
    try {
        await addEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://jqgtvretwasrrjetgrvw.supabase.co');
        await addEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ3R2cmV0d2FzcnJqZXRncnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTQyMTIsImV4cCI6MjA5NTk5MDIxMn0.m5aNg5MzPW1LDUuzs96Ot-iB3fuUGE1VB-L9FREcLMo');
        await addEnv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ3R2cmV0d2FzcnJqZXRncnZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxNDIxMiwiZXhwIjoyMDk1OTkwMjEyfQ.pWoPtDOHozD5FpR4wHAm8Ulkj99jU58J8xnpWZoptzE');
        console.log("All env vars added!");
    } catch (e) {
        console.error(e);
    }
}

run();
