import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Fetching Row Level Security (RLS) status for all public tables...');
        const { rows: tables } = await pool.query(`
            SELECT 
                c.relname AS table_name,
                c.relrowsecurity AS rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relkind IN ('r', 'p')
            ORDER BY c.relname;
        `);

        console.log('\n--- Table RLS Status ---');
        let enabledCount = 0;
        let disabledCount = 0;
        for (const t of tables) {
            console.log(`Table: ${t.table_name.padEnd(30)} | RLS Enabled: ${t.rls_enabled ? '🟢 YES' : '🔴 NO'}`);
            if (t.rls_enabled) enabledCount++;
            else disabledCount++;
        }

        console.log(`\nSummary: ${enabledCount} tables have RLS enabled. ${disabledCount} tables have RLS disabled.`);

        console.log('\nFetching all active policies...');
        const { rows: policies } = await pool.query(`
            SELECT tablename, policyname, cmd, roles, qual, with_check
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        `);

        console.log('\n--- Active Policies ---');
        console.log(`Total Policies: ${policies.length}`);
        for (const p of policies) {
            console.log(`Table: ${p.tablename.padEnd(25)} | Policy: ${p.policyname.padEnd(30)} | Cmd: ${p.cmd}`);
        }

    } catch (err) {
        console.error('Error checking RLS status:', err);
    } finally {
        await pool.end();
    }
}

run();
