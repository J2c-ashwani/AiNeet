import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
    const filePath = '/Users/ashwanikumar/.gemini/antigravity/scratch/neet-coach/scripts/migrations/006_academic_certification_program.sql';
    try {
        console.log(`Reading SQL file: ${filePath}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`SQL file loaded (${sql.length} bytes, ${sql.split('\n').length} lines). Executing...`);
        
        await pool.query(sql);
        console.log('✅ Migration 006_academic_certification_program.sql executed successfully!');

        // Verify the new tables exist
        const { rows } = await pool.query(`
            SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relname IN (
                'academic_certification_cycles',
                'academic_certification_level_results',
                'academic_certification_evidence_items',
                'academic_faculty_review_items',
                'academic_student_outcome_snapshots',
                'academic_external_review_board_members',
                'academic_external_review_signoffs',
                'certified_question_repository',
                'neet_benchmark_papers',
                'neet_benchmark_questions',
                'neet_benchmark_certification_runs',
                'academic_adversarial_evaluation_items',
                'academic_public_certification_reports'
              )
            ORDER BY c.relname;
        `);

        console.log(`\n--- Verification: ${rows.length}/13 tables created ---`);
        for (const r of rows) {
            console.log(`  ${r.table_name.padEnd(50)} RLS: ${r.rls_enabled ? '🟢 ON' : '🔴 OFF'}`);
        }

        if (rows.length === 13 && rows.every(r => r.rls_enabled)) {
            console.log('\n🎉 All 13 academic certification tables created with RLS enabled!');
        } else if (rows.length < 13) {
            console.warn(`\n⚠️  Only ${rows.length}/13 tables found. Some may have already existed or failed.`);
        }
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        if (err.detail) console.error('   Detail:', err.detail);
        if (err.hint) console.error('   Hint:', err.hint);
    } finally {
        await pool.end();
    }
}

run();
