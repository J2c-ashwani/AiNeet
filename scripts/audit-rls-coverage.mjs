import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const { Client } = pg;

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
        const { rows } = await client.query(`
            SELECT
                c.relname AS table_name,
                c.relrowsecurity AS rls_enabled,
                c.relforcerowsecurity AS rls_forced,
                COUNT(p.polname)::int AS policy_count
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            LEFT JOIN pg_policy p ON p.polrelid = c.oid
            WHERE n.nspname = 'public'
              AND c.relkind IN ('r', 'p')
            GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
            ORDER BY c.relrowsecurity ASC, c.relname ASC
        `);

        const disabled = rows.filter(row => !row.rls_enabled);
        const enabledNoPolicies = rows.filter(row => row.rls_enabled && row.policy_count === 0);

        console.log('\nRLS COVERAGE AUDIT');
        console.log('------------------');
        console.log(`  Public tables scanned: ${rows.length}`);
        console.log(`  RLS disabled:          ${disabled.length}`);
        console.log(`  RLS enabled/no policy: ${enabledNoPolicies.length}`);

        if (disabled.length > 0) {
            console.log('\nTables with RLS disabled:');
            for (const row of disabled) console.log(`  - ${row.table_name}`);
        }

        if (enabledNoPolicies.length > 0) {
            console.log('\nRLS-enabled tables with no policies (backend/service-role only unless intended):');
            for (const row of enabledNoPolicies) console.log(`  - ${row.table_name}`);
        }

        console.log('\nPolicy counts:');
        for (const row of rows) {
            const status = row.rls_enabled ? 'enabled ' : 'disabled';
            console.log(`  ${status}  policies=${String(row.policy_count).padStart(2, ' ')}  ${row.table_name}`);
        }

        process.exit(disabled.length > 0 ? 1 : 0);
    } finally {
        await client.end();
    }
}

main().catch(error => {
    console.error('RLS audit failed:', error.message);
    process.exit(1);
});
