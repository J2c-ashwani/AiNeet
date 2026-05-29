import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const { Client } = pg;
const shouldApply = process.argv.includes('--apply');
const migrationPath = path.join(process.cwd(), 'scripts/migrations/005_enable_rls_public_tables.sql');

async function listDisabledTables(client) {
    const { rows } = await client.query(`
        SELECT c.relname AS table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p')
          AND c.relrowsecurity = FALSE
        ORDER BY c.relname
    `);
    return rows.map(row => row.table_name);
}

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set. Load .env.local or export DATABASE_URL first.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    try {
        const before = await listDisabledTables(client);
        console.log('\nRLS HARDENING');
        console.log('-------------');
        console.log(`  Tables with RLS disabled before: ${before.length}`);
        for (const table of before) console.log(`  - ${table}`);

        if (!shouldApply) {
            console.log('\nDry run only. Re-run with --apply to execute:');
            console.log('  node scripts/apply-rls-hardening.mjs --apply');
            return;
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');
        await client.query(sql);

        const after = await listDisabledTables(client);
        console.log(`\n  Tables with RLS disabled after: ${after.length}`);
        for (const table of after) console.log(`  - ${table}`);

        if (after.length > 0) {
            console.error('\nRLS hardening incomplete. Some tables still have RLS disabled.');
            process.exit(1);
        }

        console.log('\nRLS hardening applied successfully.');
    } finally {
        await client.end();
    }
}

main().catch(error => {
    console.error('RLS hardening failed:', error.message);
    process.exit(1);
});
