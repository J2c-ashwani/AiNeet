import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const CATEGORY_A_TABLES = [
    { table: 'user_achievements', col: 'user_id' },
    { table: 'battle_elo', col: 'user_id' },
    { table: 'user_usage', col: 'user_id' },
    { table: 'revision_schedule', col: 'user_id' },
    { table: 'study_plans', col: 'user_id' },
    { table: 'battleground_rooms', col: 'host_user_id' },
    { table: 'battleground_players', col: 'user_id' }
];

async function run() {
    const client = await pool.connect();
    try {
        console.log('🚀 Modifying users table for Soft Deletions...');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS scrubbed_identity INTEGER DEFAULT 0;
        `);

        console.log('👻 Creating the centralized Ghost User...');
        await client.query(`
            INSERT INTO users (id, name, email, password_hash, role)
            VALUES (
                '00000000-0000-0000-0000-000000000000', 
                'Deleted User Analytics', 
                'ghost@neetcoach.internal', 
                'none', 
                'ghost'
            )
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('⚙️ Converting Category A Tables to Safe ON DELETE CASCADE...');
        
        for (const target of CATEGORY_A_TABLES) {
            // Find the foreign key constraint name linking this table to users table
            const res = await client.query(`
                SELECT tc.constraint_name 
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                WHERE tc.table_name = $1 
                  AND kcu.column_name = $2 
                  AND ccu.table_name = 'users'
                  AND tc.constraint_type = 'FOREIGN KEY'
            `, [target.table, target.col]);

            if (res.rows.length > 0) {
                const constraintName = res.rows[0].constraint_name;
                console.log(`  -> Altering ${target.table} (${constraintName})`);
                await client.query(`ALTER TABLE ${target.table} DROP CONSTRAINT ${constraintName}`);
                await client.query(`
                    ALTER TABLE ${target.table} 
                    ADD CONSTRAINT ${constraintName} 
                    FOREIGN KEY (${target.col}) REFERENCES users(id) ON DELETE CASCADE
                `);
            } else {
                console.log(`  -> Skipping ${target.table} (no constraint found)`);
            }
        }

        console.log('✅ Layer 6 Migration Complete.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
