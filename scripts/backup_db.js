const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase. Requires Service Role Key for full bypass.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define minimum tables to backup. Adjust as needed.
const TABLES = [
    'users',
    'profiles', // if exists
    'subscriptions',
    'battles',
    'battle_participants'
];

async function runBackup() {
    console.log(`Starting Data Backup for ${TABLES.length} critical tables...`);
    
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let successCount = 0;

    for (const table of TABLES) {
        try {
            console.log(`Extracting ${table}...`);
            // WARNING: Free tier restricts to 1000 rows. If you have more, you must implement pagination here.
            const { data, error } = await supabase.from(table).select('*').limit(1000);
            
            if (error) {
                // If table doesn't exist, we skip gracefully
                console.warn(`[!] Error reading ${table} (might not exist): ${error.message}`);
                continue;
            }

            const fileName = path.join(backupDir, `${table}_${timestamp}.json`);
            fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
            console.log(`[+] Saved ${data.length} records to ${table}_${timestamp}.json`);
            successCount++;

        } catch (e) {
            console.error(`[!] Exception on ${table}: ${e.message}`);
        }
    }

    console.log(`\n✅ Backup complete! Successfully exported ${successCount} tables.`);
    console.log("CRITICAL MD NOTE: If you pass 1000 users, you MUST add pagination to this script or upgrade Supabase to Pro tier for automated Point-in-Time-Recovery (PITR).");
}

runBackup();
