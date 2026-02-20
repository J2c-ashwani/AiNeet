
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { Client } = require('pg');

// Configuration
const SQLITE_DB_PATH = path.join(__dirname, '../neet-coach.db');
const POSTGRES_URL = process.env.DATABASE_URL; // e.g., postgres://user:pass@localhost:5432/neetcoach

if (!POSTGRES_URL) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    console.log('Usage: DATABASE_URL=postgres://... node scripts/migrate_to_postgres.js');
    process.exit(1);
}

if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.error(`Error: SQLite database not found at ${SQLITE_DB_PATH}`);
    process.exit(1);
}

const sqlite = new Database(SQLITE_DB_PATH);
const pgClient = new Client({ connectionString: POSTGRES_URL });

async function migrate() {
    console.log('🚀 Starting Partial Migration (SQLite -> PostgreSQL)...');

    try {
        await pgClient.connect();
        console.log('✅ Connected to PostgreSQL');

        // 1. Get list of tables from SQLite
        const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

        for (const table of tables) {
            const tableName = table.name;
            console.log(`\n📦 Migrating table: ${tableName}`);

            // Get data from SQLite
            const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
            if (rows.length === 0) {
                console.log(`   Internal: No data in ${tableName}, skipping.`);
                continue;
            }

            // Get columns from first row
            const columns = Object.keys(rows[0]);
            const placeHolders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeHolders}) ON CONFLICT DO NOTHING`;

            console.log(`   Preparing to insert ${rows.length} rows...`);

            // Insert into Postgres (Batching would be better for huge datasets, but loop is fine for <10k rows)
            let successCount = 0;
            for (const row of rows) {
                const values = columns.map(col => {
                    const val = row[col];
                    // Handle boolean typical in SQLite (0/1) if Postgres schema expects boolean
                    // For now, assuming Postgres schema uses INTEGER for flags or we rely on implicit casting if needed
                    // Actually, my `lib/schema.js` uses INTEGER for flags in SQLite. 
                    // If Postgres schema uses BOOLEAN, we need conversion.
                    // But I don't know the exact Postgres schema yet. 
                    // Assuming the user runs `lib/schema.js` against Postgres first which creates tables?
                    // My `lib/schema.js` uses generic SQL types compatible with both mostly (TEXT, INTEGER, REAL).
                    return val;
                });

                try {
                    await pgClient.query(insertQuery, values);
                    successCount++;
                } catch (err) {
                    console.error(`   ❌ Failed to insert row in ${tableName}:`, err.message);
                }
            }
            console.log(`   ✅ Migrated ${successCount}/${rows.length} rows.`);
        }

        console.log('\n🎉 Migration Complete!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pgClient.end();
        sqlite.close();
    }
}

migrate();
