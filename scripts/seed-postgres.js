/**
 * PostgreSQL Seed Script for Supabase
 * 
 * Creates the full schema and seeds syllabus + questions into Supabase PostgreSQL.
 * Usage: node scripts/seed-postgres.js
 */

const { Pool } = require('pg');
const { NEET_SYLLABUS } = require('../data/syllabus');
const { PHYSICS_QUESTIONS, CHEMISTRY_QUESTIONS, BIOLOGY_QUESTIONS } = require('../data/questions');
const { PHYSICS_EXTRA, CHEMISTRY_EXTRA, BIOLOGY_EXTRA } = require('../data/questions-extra');
const { PHYSICS_PYQ, CHEMISTRY_PYQ, BIOLOGY_PYQ } = require('../data/questions-pyq');

// ─── Load env vars ───
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env.local');
    process.exit(1);
}

console.log('🔌 Connecting to Supabase PostgreSQL...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    const client = await pool.connect();

    try {
        console.log('✅ Connected to Supabase!');

        // ─── Drop existing tables (clean slate) ───
        console.log('🗑️  Dropping existing tables (clean slate)...');
        await client.query(`
            DROP TABLE IF EXISTS battleground_players CASCADE;
            DROP TABLE IF EXISTS battleground_rooms CASCADE;
            DROP TABLE IF EXISTS test_attempts CASCADE;
            DROP TABLE IF EXISTS ncert_books CASCADE;
            DROP TABLE IF EXISTS ncert_content CASCADE;
            DROP TABLE IF EXISTS question_difficulty_dynamic CASCADE;
            DROP TABLE IF EXISTS user_topic_mastery CASCADE;
            DROP TABLE IF EXISTS ai_response_cache CASCADE;
            DROP TABLE IF EXISTS user_usage CASCADE;
            DROP TABLE IF EXISTS payments CASCADE;
            DROP TABLE IF EXISTS question_reports CASCADE;
            DROP TABLE IF EXISTS battles CASCADE;
            DROP TABLE IF EXISTS battle_elo CASCADE;
            DROP TABLE IF EXISTS user_chapter_progress CASCADE;
            DROP TABLE IF EXISTS user_achievements CASCADE;
            DROP TABLE IF EXISTS study_plans CASCADE;
            DROP TABLE IF EXISTS doubt_messages CASCADE;
            DROP TABLE IF EXISTS doubt_conversations CASCADE;
            DROP TABLE IF EXISTS user_performance CASCADE;
            DROP TABLE IF EXISTS test_answers CASCADE;
            DROP TABLE IF EXISTS tests CASCADE;
            DROP TABLE IF EXISTS revision_schedule CASCADE;
            DROP TABLE IF EXISTS mistake_log CASCADE;
            DROP TABLE IF EXISTS questions CASCADE;
            DROP TABLE IF EXISTS topics CASCADE;
            DROP TABLE IF EXISTS chapters CASCADE;
            DROP TABLE IF EXISTS subjects CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        // ─── Create Schema (PostgreSQL syntax) ───
        console.log('🏗️  Creating PostgreSQL schema...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                target_year INTEGER DEFAULT 2026,
                avatar TEXT DEFAULT 'default',
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                streak INTEGER DEFAULT 0,
                last_active_date TEXT,
                daily_goal INTEGER DEFAULT 50,
                subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro')),
                subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'expired', 'cancelled')),
                subscription_expiry TEXT,
                parent_email TEXT,
                parent_phone TEXT,
                role TEXT DEFAULT 'student',
                referral_code TEXT UNIQUE,
                referred_by TEXT,
                battle_elo INTEGER DEFAULT 1000,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                icon TEXT,
                color TEXT
            );

            CREATE TABLE IF NOT EXISTS chapters (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER NOT NULL REFERENCES subjects(id),
                name TEXT NOT NULL,
                class_level INTEGER DEFAULT 11,
                order_index INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS topics (
                id SERIAL PRIMARY KEY,
                chapter_id INTEGER NOT NULL REFERENCES chapters(id),
                name TEXT NOT NULL,
                weightage INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                topic_id INTEGER NOT NULL REFERENCES topics(id),
                chapter_id INTEGER NOT NULL REFERENCES chapters(id),
                subject_id INTEGER NOT NULL REFERENCES subjects(id),
                text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_option TEXT NOT NULL CHECK(correct_option IN ('A','B','C','D')),
                difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard','neet')),
                explanation TEXT,
                year_asked TEXT,
                tags TEXT,
                is_ai_generated INTEGER DEFAULT 0,
                source_context TEXT,
                confidence_score INTEGER DEFAULT 0,
                verification_status TEXT DEFAULT 'pending',
                verified_answer TEXT,
                quality_score REAL DEFAULT 0,
                flag_count INTEGER DEFAULT 0,
                is_pyq INTEGER DEFAULT 0,
                exam_name TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS tests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                type TEXT NOT NULL DEFAULT 'custom' CHECK(type IN ('custom','topic','chapter','mock','practice','pyq')),
                config_json TEXT,
                total_questions INTEGER DEFAULT 0,
                total_marks INTEGER DEFAULT 0,
                score REAL,
                correct_count INTEGER DEFAULT 0,
                incorrect_count INTEGER DEFAULT 0,
                unanswered_count INTEGER DEFAULT 0,
                time_taken_seconds INTEGER DEFAULT 0,
                started_at TIMESTAMP DEFAULT NOW(),
                completed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS test_answers (
                id SERIAL PRIMARY KEY,
                test_id TEXT NOT NULL REFERENCES tests(id),
                question_id INTEGER NOT NULL REFERENCES questions(id),
                selected_option TEXT,
                is_correct INTEGER,
                time_spent_seconds INTEGER DEFAULT 0,
                is_marked INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS user_performance (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                topic_id INTEGER NOT NULL REFERENCES topics(id),
                accuracy REAL DEFAULT 0,
                total_attempted INTEGER DEFAULT 0,
                total_correct INTEGER DEFAULT 0,
                avg_time_seconds REAL DEFAULT 0,
                last_attempted TEXT,
                UNIQUE(user_id, topic_id)
            );

            CREATE TABLE IF NOT EXISTS study_plans (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                date TEXT NOT NULL,
                plan_json TEXT NOT NULL,
                is_completed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS doubt_conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                title TEXT DEFAULT 'New Chat',
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS doubt_messages (
                id SERIAL PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES doubt_conversations(id),
                role TEXT NOT NULL CHECK(role IN ('user','assistant')),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS user_achievements (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                badge_type TEXT NOT NULL,
                badge_name TEXT NOT NULL,
                description TEXT,
                earned_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS user_chapter_progress (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                chapter_id INTEGER NOT NULL REFERENCES chapters(id),
                is_completed INTEGER DEFAULT 0,
                mastery_level REAL DEFAULT 0,
                UNIQUE(user_id, chapter_id)
            );

            CREATE TABLE IF NOT EXISTS battle_elo (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                elo_rating INTEGER DEFAULT 1200,
                matches_played INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                streak INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS battles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                opponent_id TEXT,
                opponent_name TEXT,
                user_score INTEGER DEFAULT 0,
                opponent_score INTEGER DEFAULT 0,
                outcome TEXT,
                elo_change INTEGER DEFAULT 0,
                questions TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS question_reports (
                id SERIAL PRIMARY KEY,
                question_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                issue_type TEXT,
                description TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT DEFAULT 'pending',
                provider_payment_id TEXT,
                provider_order_id TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS user_usage (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                month TEXT NOT NULL,
                ai_test_count INTEGER DEFAULT 0,
                ai_doubt_count INTEGER DEFAULT 0,
                ncert_explain_count INTEGER DEFAULT 0,
                ai_tokens_used INTEGER DEFAULT 0,
                last_reset_date TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, month)
            );

            CREATE TABLE IF NOT EXISTS ai_response_cache (
                id SERIAL PRIMARY KEY,
                request_hash TEXT UNIQUE NOT NULL,
                response TEXT NOT NULL,
                confidence_score INTEGER,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_topic_mastery (
                user_id TEXT,
                topic_id TEXT,
                mastery_score REAL DEFAULT 0,
                confidence_score REAL DEFAULT 0,
                questions_attempted INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY (user_id, topic_id)
            );

            CREATE TABLE IF NOT EXISTS question_difficulty_dynamic (
                question_id TEXT PRIMARY KEY,
                difficulty_score REAL DEFAULT 1.0,
                attempts INTEGER DEFAULT 0,
                correct_attempts INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ncert_content (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER,
                chapter_id INTEGER,
                title TEXT,
                file_path TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ncert_books (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                chapter_id INTEGER,
                title TEXT,
                file_path TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS test_attempts (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                test_id TEXT,
                score REAL,
                accuracy REAL,
                completed_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS revision_schedule (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                question_id INTEGER REFERENCES questions(id),
                easiness_factor REAL DEFAULT 2.5,
                interval INTEGER DEFAULT 0,
                repetitions INTEGER DEFAULT 0,
                next_review_at TIMESTAMP,
                last_reviewed_at TIMESTAMP,
                UNIQUE(user_id, question_id)
            );

            CREATE TABLE IF NOT EXISTS mistake_log (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                question_id INTEGER REFERENCES questions(id),
                test_id TEXT,
                selected_option TEXT,
                correct_option TEXT,
                logged_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS battleground_rooms (
                id TEXT PRIMARY KEY,
                host_user_id TEXT NOT NULL,
                invite_code TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'waiting',
                subject_id TEXT,
                max_players INTEGER DEFAULT 4,
                question_count INTEGER DEFAULT 5,
                questions TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                started_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS battleground_players (
                id SERIAL PRIMARY KEY,
                room_id TEXT REFERENCES battleground_rooms(id),
                user_id TEXT NOT NULL,
                user_name TEXT,
                score INTEGER DEFAULT 0,
                answers TEXT DEFAULT '[]',
                finished INTEGER DEFAULT 0,
                joined_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(room_id, user_id)
            );
        `);

        // ─── Create Indexes ───
        console.log('📇 Creating indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id)',
            'CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id)',
            'CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id)',
            'CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)',
            'CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id)',
            'CREATE INDEX IF NOT EXISTS idx_topics_chapter ON topics(chapter_id)',
            'CREATE INDEX IF NOT EXISTS idx_tests_user ON tests(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_test_answers_test ON test_answers(test_id)',
            'CREATE INDEX IF NOT EXISTS idx_revision_user ON revision_schedule(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_performance_user ON user_performance(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_doubts_user ON doubt_conversations(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_usage_user_month ON user_usage(user_id, month)',
        ];
        for (const idx of indexes) {
            await client.query(idx);
        }

        // ─── Seed Syllabus ───
        console.log('🌱 Seeding subjects, chapters, and topics...');

        await client.query('BEGIN');

        const subjectMap = {};
        const chapterMap = {};
        const topicMap = {};

        for (const [key, subject] of Object.entries(NEET_SYLLABUS)) {
            const sRes = await client.query(
                'INSERT INTO subjects (name, icon, color) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET icon = $2 RETURNING id',
                [subject.name, subject.icon, subject.color]
            );
            const subjectId = sRes.rows[0].id;
            subjectMap[subject.name] = subjectId;

            for (let idx = 0; idx < subject.chapters.length; idx++) {
                const chapter = subject.chapters[idx];
                const chRes = await client.query(
                    'INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
                    [subjectId, chapter.name, chapter.class, idx]
                );
                const chapterId = chRes.rows[0].id;
                chapterMap[chapter.name] = chapterId;

                for (const topic of chapter.topics) {
                    const tRes = await client.query(
                        'INSERT INTO topics (chapter_id, name, weightage) VALUES ($1, $2, $3) RETURNING id',
                        [chapterId, topic, 1]
                    );
                    topicMap[`${chapter.name}::${topic}`] = tRes.rows[0].id;
                }
            }
        }

        await client.query('COMMIT');

        // ─── Seed Questions ───
        console.log('❓ Seeding questions...');

        await client.query('BEGIN');

        const allQuestions = [
            { questions: [...PHYSICS_QUESTIONS, ...PHYSICS_EXTRA, ...PHYSICS_PYQ], subject: 'Physics' },
            { questions: [...CHEMISTRY_QUESTIONS, ...CHEMISTRY_EXTRA, ...CHEMISTRY_PYQ], subject: 'Chemistry' },
            { questions: [...BIOLOGY_QUESTIONS, ...BIOLOGY_EXTRA, ...BIOLOGY_PYQ], subject: 'Biology' },
        ];

        let inserted = 0;
        let skipped = 0;

        for (const { questions, subject } of allQuestions) {
            const subjectId = subjectMap[subject];
            for (const q of questions) {
                const chapterId = chapterMap[q.chapter];
                if (!chapterId) { skipped++; continue; }

                const topicKey = `${q.chapter}::${q.topic}`;
                let topicId = topicMap[topicKey];

                // Fallback to first topic of chapter
                if (!topicId) {
                    const ftRes = await client.query('SELECT id FROM topics WHERE chapter_id = $1 LIMIT 1', [chapterId]);
                    topicId = ftRes.rows[0]?.id;
                }
                if (!topicId) { skipped++; continue; }

                const isPyq = q.year_asked ? 1 : 0;

                await client.query(
                    `INSERT INTO questions (topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, is_pyq, year_asked, tags)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                    [topicId, chapterId, subjectId, q.text,
                        q.options[0], q.options[1], q.options[2], q.options[3],
                        q.correct, q.difficulty || 'medium', q.explanation || '',
                        isPyq, q.year_asked || null, q.tags || null]
                );
                inserted++;
            }
        }

        await client.query('COMMIT');

        // ─── Summary ───
        const counts = {
            subjects: (await client.query('SELECT COUNT(*) as c FROM subjects')).rows[0].c,
            chapters: (await client.query('SELECT COUNT(*) as c FROM chapters')).rows[0].c,
            topics: (await client.query('SELECT COUNT(*) as c FROM topics')).rows[0].c,
            questions: (await client.query('SELECT COUNT(*) as c FROM questions')).rows[0].c,
            pyqs: (await client.query('SELECT COUNT(*) as c FROM questions WHERE is_pyq = 1')).rows[0].c,
        };

        console.log(`\n🎉 Supabase database seeded successfully!`);
        console.log(`   📚 Subjects:  ${counts.subjects}`);
        console.log(`   📖 Chapters:  ${counts.chapters}`);
        console.log(`   📝 Topics:    ${counts.topics}`);
        console.log(`   ❓ Questions: ${counts.questions} (${counts.pyqs} PYQs)`);
        console.log(`   ✅ Inserted: ${inserted}, ⚠️ Skipped: ${skipped}`);
        console.log(`\n🚀 Database is LIVE on Supabase! Run 'npm run dev' and register at /register`);

    } catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('❌ Seed failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
