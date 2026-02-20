/**
 * Standalone Database Seeder
 * 
 * This script directly uses better-sqlite3 to seed the database.
 * It bypasses the adapter (which uses ESM imports) and works with CommonJS.
 * 
 * Usage: node scripts/seed-standalone.js
 */

const Database = require('better-sqlite3');
const path = require('path');

// Data files
const { NEET_SYLLABUS } = require('../data/syllabus');
const { PHYSICS_QUESTIONS, CHEMISTRY_QUESTIONS, BIOLOGY_QUESTIONS } = require('../data/questions');
const { PHYSICS_EXTRA, CHEMISTRY_EXTRA, BIOLOGY_EXTRA } = require('../data/questions-extra');
const { PHYSICS_PYQ, CHEMISTRY_PYQ, BIOLOGY_PYQ } = require('../data/questions-pyq');

// ─── Initialize SQLite ───
const dbPath = path.join(process.cwd(), 'neet-coach.db');
console.log(`📦 Database path: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Schema ───
console.log('🏗️  Creating database schema...');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_active_date TEXT,
        subscription_tier TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
        subscription_expires TEXT,
        parent_email TEXT,
        parent_phone TEXT,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        battle_elo INTEGER DEFAULT 1000,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        color TEXT
    );

    CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER REFERENCES subjects(id),
        name TEXT NOT NULL,
        class_level INTEGER,
        order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER REFERENCES chapters(id),
        name TEXT NOT NULL,
        weightage REAL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER REFERENCES topics(id),
        chapter_id INTEGER REFERENCES chapters(id),
        subject_id INTEGER REFERENCES subjects(id),
        text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL CHECK(correct_option IN ('A','B','C','D')),
        difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
        explanation TEXT,
        is_pyq INTEGER DEFAULT 0,
        exam_name TEXT,
        year_asked TEXT,
        tags TEXT,
        is_ai_generated INTEGER DEFAULT 0,
        confidence_score REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT DEFAULT 'practice',
        score REAL,
        accuracy REAL,
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        unanswered_count INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS test_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT REFERENCES tests(id),
        question_id INTEGER REFERENCES questions(id),
        selected_option TEXT,
        is_correct INTEGER,
        time_spent_seconds INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS doubt_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doubt_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT REFERENCES doubt_conversations(id),
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS revision_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        question_id INTEGER REFERENCES questions(id),
        easiness_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review_at DATETIME,
        last_reviewed_at DATETIME,
        UNIQUE(user_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS user_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        topic_id INTEGER REFERENCES topics(id),
        accuracy REAL DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        correct_attempts INTEGER DEFAULT 0,
        UNIQUE(user_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        achievement_key TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_key)
    );

    CREATE TABLE IF NOT EXISTS study_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        plan_data TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS question_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER REFERENCES questions(id),
        user_id TEXT,
        reason TEXT,
        comment TEXT,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        month TEXT NOT NULL,
        ai_test_count INTEGER DEFAULT 0,
        ai_doubt_count INTEGER DEFAULT 0,
        ncert_explain_count INTEGER DEFAULT 0,
        ai_tokens_used INTEGER DEFAULT 0,
        UNIQUE(user_id, month)
    );

    CREATE TABLE IF NOT EXISTS user_topic_mastery (
        user_id TEXT,
        topic_id TEXT,
        mastery_score REAL DEFAULT 0,
        confidence_score REAL DEFAULT 0,
        questions_attempted INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS question_difficulty_dynamic (
        question_id TEXT PRIMARY KEY,
        difficulty_score REAL DEFAULT 1.0,
        attempts INTEGER DEFAULT 0,
        correct_attempts INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS battle_elo (
        user_id TEXT PRIMARY KEY,
        battle_elo INTEGER DEFAULT 1000,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS battles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        opponent_id TEXT,
        opponent_name TEXT,
        user_score INTEGER DEFAULT 0,
        opponent_score INTEGER DEFAULT 0,
        outcome TEXT,
        elo_change INTEGER DEFAULT 0,
        questions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mistake_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        question_id INTEGER REFERENCES questions(id),
        test_id TEXT,
        selected_option TEXT,
        correct_option TEXT,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_chapter_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chapter_id INTEGER REFERENCES chapters(id),
        questions_attempted INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        last_practiced DATETIME,
        UNIQUE(user_id, chapter_id)
    );

    CREATE TABLE IF NOT EXISTS ncert_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER,
        chapter_id INTEGER,
        title TEXT,
        file_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS battleground_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT REFERENCES battleground_rooms(id),
        user_id TEXT NOT NULL,
        user_name TEXT,
        score INTEGER DEFAULT 0,
        answers TEXT DEFAULT '[]',
        finished INTEGER DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
indexes.forEach(idx => db.exec(idx));

// ─── Seed Data ───
console.log('🌱 Seeding subjects, chapters, and topics...');

const insertSubject = db.prepare('INSERT OR IGNORE INTO subjects (name, icon, color) VALUES (?, ?, ?)');
const insertChapter = db.prepare('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, ?, ?)');
const insertTopic = db.prepare('INSERT INTO topics (chapter_id, name, weightage) VALUES (?, ?, ?)');
const insertQuestion = db.prepare(`
    INSERT INTO questions (topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, is_pyq, year_asked, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const subjectMap = {};
const chapterMap = {};
const topicMap = {};

// Seed syllabus in a transaction
const seedSyllabus = db.transaction(() => {
    for (const [key, subject] of Object.entries(NEET_SYLLABUS)) {
        const result = insertSubject.run(subject.name, subject.icon, subject.color);
        const subjectId = result.lastInsertRowid;
        subjectMap[subject.name] = subjectId;

        subject.chapters.forEach((chapter, idx) => {
            const chResult = insertChapter.run(subjectId, chapter.name, chapter.class, idx);
            const chapterId = chResult.lastInsertRowid;
            chapterMap[chapter.name] = chapterId;

            chapter.topics.forEach((topic) => {
                const tResult = insertTopic.run(chapterId, topic, 1);
                topicMap[`${chapter.name}::${topic}`] = tResult.lastInsertRowid;
            });
        });
    }
});
seedSyllabus();

// Seed questions in a transaction
console.log('❓ Seeding questions (this may take a moment)...');

const seedQuestions = db.transaction(() => {
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
            if (!chapterId) {
                skipped++;
                continue;
            }

            // Find topic ID
            const topicKey = `${q.chapter}::${q.topic}`;
            let topicId = topicMap[topicKey];

            // Fallback to first topic of chapter
            if (!topicId) {
                const firstTopic = db.prepare('SELECT id FROM topics WHERE chapter_id = ? LIMIT 1').get(chapterId);
                topicId = firstTopic ? firstTopic.id : null;
            }
            if (!topicId) {
                skipped++;
                continue;
            }

            const isPyq = q.year_asked ? 1 : 0;

            insertQuestion.run(
                topicId, chapterId, subjectId,
                q.text,
                q.options[0], q.options[1], q.options[2], q.options[3],
                q.correct,
                q.difficulty || 'medium',
                q.explanation || '',
                isPyq,
                q.year_asked || null,
                q.tags || null
            );
            inserted++;
        }
    }

    console.log(`   ✅ Inserted: ${inserted}, ⚠️ Skipped: ${skipped}`);
});
seedQuestions();

// ─── Summary ───
const subjectCount = db.prepare('SELECT COUNT(*) as c FROM subjects').get().c;
const chapterCount = db.prepare('SELECT COUNT(*) as c FROM chapters').get().c;
const topicCount = db.prepare('SELECT COUNT(*) as c FROM topics').get().c;
const questionCount = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
const pyqCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE is_pyq = 1').get().c;

console.log(`\n🎉 Database seeded successfully!`);
console.log(`   📚 Subjects:  ${subjectCount}`);
console.log(`   📖 Chapters:  ${chapterCount}`);
console.log(`   📝 Topics:    ${topicCount}`);
console.log(`   ❓ Questions: ${questionCount} (${pyqCount} PYQs)`);
console.log(`\n🚀 Next: Run 'npm run dev' and register at /register`);

db.close();
