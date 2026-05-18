require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const EXPECTED_SCHEMA = {
  users: ['id', 'fcm_token', 'fcm_token_updated_at', 'xp', 'streak', 'trust_score'],
  user_devices: ['id', 'user_id', 'device_id', 'fcm_token', 'push_permission', 'last_seen_at', 'is_active'],
  tests: ['id', 'user_id', 'type', 'score', 'completed_at'],
  test_answers: ['id', 'test_id', 'user_id', 'question_id', 'selected_option', 'is_correct'],
  mistake_log: ['id', 'user_id', 'question_id', 'test_id', 'mistake_count'],
  user_performance: ['user_id', 'topic_id', 'total_attempted', 'total_correct', 'accuracy'],
  omr_scans: ['id', 'user_id', 'test_id', 'accuracy_percentage'],
  test_attempts: ['id', 'test_id', 'user_id', 'total_score', 'correct_answers', 'incorrect_answers'],
  subscriptions: ['id', 'user_id', 'plan_tier', 'billing_status', 'external_subscription_id']
};

async function runAudit() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('--- RUNNING SCHEMA CONTRACT AUDIT ---\n');

    let errors = 0;

    for (const [table, expectedColumns] of Object.entries(EXPECTED_SCHEMA)) {
      const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1;
      `, [table]);

      const actualColumns = res.rows.map(r => r.column_name);

      if (actualColumns.length === 0) {
        console.error(`❌ ERROR: Table '${table}' DOES NOT EXIST in production schema.`);
        errors++;
        continue;
      }

      const missing = expectedColumns.filter(c => !actualColumns.includes(c));
      if (missing.length > 0) {
        console.error(`❌ ERROR: Table '${table}' is missing required columns: ${missing.join(', ')}`);
        errors++;
      } else {
        console.log(`✅ Table '${table}' contract verified.`);
      }
    }

    if (errors === 0) {
      console.log('\n✅ SCHEMA AUDIT PASSED: 0 Drift Detected.');
      process.exit(0);
    } else {
      console.log(`\n❌ SCHEMA AUDIT FAILED: ${errors} errors detected.`);
      process.exit(1);
    }

  } catch (err) {
    console.error('Audit failed to run:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runAudit();
