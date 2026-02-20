import { getDb } from './lib/db.js';

async function migrate() {
    const db = getDb();
    console.log("Creating production database indexes...");

    const indexes = [
        // Auth & User lookups
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)',

        // Test query optimization
        'CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_tests_completed ON tests(completed_at)',
        'CREATE INDEX IF NOT EXISTS idx_test_answers_test_id ON test_answers(test_id)',
        'CREATE INDEX IF NOT EXISTS idx_test_answers_question_id ON test_answers(question_id)',

        // Question bank lookups
        'CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id)',
        'CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id)',
        'CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id)',
        'CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)',
        'CREATE INDEX IF NOT EXISTS idx_questions_pyq ON questions(is_pyq)',

        // Performance analytics
        'CREATE INDEX IF NOT EXISTS idx_user_performance_user ON user_performance(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_performance_topic ON user_performance(topic_id)',

        // Study plans
        'CREATE INDEX IF NOT EXISTS idx_study_plans_user_date ON study_plans(user_id, date)',

        // Doubts
        'CREATE INDEX IF NOT EXISTS idx_doubt_conversations_user ON doubt_conversations(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_doubt_messages_conversation ON doubt_messages(conversation_id)',

        // Achievements
        'CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id)',

        // Battleground lookups
        'CREATE INDEX IF NOT EXISTS idx_battlegrounds_invite ON battlegrounds(invite_code)',
        'CREATE INDEX IF NOT EXISTS idx_battlegrounds_creator ON battlegrounds(creator_id)',
        'CREATE INDEX IF NOT EXISTS idx_bg_participants_battle ON battleground_participants(battleground_id)',
        'CREATE INDEX IF NOT EXISTS idx_bg_participants_user ON battleground_participants(user_id)',

        // Challenge lookups
        'CREATE INDEX IF NOT EXISTS idx_challenges_creator ON challenges(creator_id)',

        // Usage tracking
        'CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month)',

        // AI cache
        'CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_response_cache(request_hash)',
        'CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_response_cache(expires_at)',

        // Payments
        'CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
    ];

    let created = 0;
    for (const sql of indexes) {
        try {
            await db.exec(sql);
            created++;
        } catch (e) {
            console.warn(`Skipped: ${sql.substring(0, 60)}... (${e.message})`);
        }
    }

    console.log(`Created ${created}/${indexes.length} indexes successfully.`);
    await db.close();
}

migrate();
