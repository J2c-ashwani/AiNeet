const { getDb } = require('./db');
const { initializeDatabase } = require('./schema');
const { NEET_SYLLABUS } = require('../data/syllabus');
const { PHYSICS_QUESTIONS, CHEMISTRY_QUESTIONS, BIOLOGY_QUESTIONS } = require('../data/questions');
const { PHYSICS_EXTRA, CHEMISTRY_EXTRA, BIOLOGY_EXTRA } = require('../data/questions-extra');
const { PHYSICS_PYQ, CHEMISTRY_PYQ, BIOLOGY_PYQ } = require('../data/questions-pyq');

function seed() {
    const db = getDb();

    // Clear existing data
    // Drop tables to ensure schema update
    db.exec(`
    DROP TABLE IF EXISTS mistake_log;
    DROP TABLE IF EXISTS user_achievements;
    DROP TABLE IF EXISTS user_chapter_progress;
    DROP TABLE IF EXISTS user_performance;
    DROP TABLE IF EXISTS doubt_messages;
    DROP TABLE IF EXISTS doubt_conversations;
    DROP TABLE IF EXISTS study_plans;
    DROP TABLE IF EXISTS test_answers;
    DROP TABLE IF EXISTS tests;
    DROP TABLE IF EXISTS questions;
    DROP TABLE IF EXISTS topics;
    DROP TABLE IF EXISTS chapters;
    DROP TABLE IF EXISTS subjects;
    DROP TABLE IF EXISTS users;
  `);

    initializeDatabase();

    const insertSubject = db.prepare('INSERT INTO subjects (name, icon, color) VALUES (?, ?, ?)');
    const insertChapter = db.prepare('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, ?, ?)');
    const insertTopic = db.prepare('INSERT INTO topics (chapter_id, name, weightage) VALUES (?, ?, ?)');
    const insertQuestion = db.prepare(`
    INSERT INTO questions (topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, year_asked, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const subjectMap = {};
    const chapterMap = {};
    const topicMap = {};

    // Seed subjects, chapters, topics
    const seedTransaction = db.transaction(() => {
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
    seedTransaction();

    // Seed questions (original + extra + pyq)
    const seedQuestionsTransaction = db.transaction(() => {
        const allQuestions = [
            { questions: [...PHYSICS_QUESTIONS, ...PHYSICS_EXTRA, ...PHYSICS_PYQ], subject: 'Physics' },
            { questions: [...CHEMISTRY_QUESTIONS, ...CHEMISTRY_EXTRA, ...CHEMISTRY_PYQ], subject: 'Chemistry' },
            { questions: [...BIOLOGY_QUESTIONS, ...BIOLOGY_EXTRA, ...BIOLOGY_PYQ], subject: 'Biology' },
        ];

        for (const { questions, subject } of allQuestions) {
            const subjectId = subjectMap[subject];
            for (const q of questions) {
                const chapterId = chapterMap[q.chapter];
                if (!chapterId) {
                    console.warn(`Chapter not found: ${q.chapter}`);
                    continue;
                }

                // Find topic ID
                const topicKey = `${q.chapter}::${q.topic}`;
                let topicId = topicMap[topicKey];

                // If exact topic not found, find first topic of chapter
                if (!topicId) {
                    const firstTopic = db.prepare('SELECT id FROM topics WHERE chapter_id = ? LIMIT 1').get(chapterId);
                    topicId = firstTopic ? firstTopic.id : null;
                }
                if (!topicId) {
                    console.warn(`Topic not found: ${topicKey}`);
                    continue;
                }

                insertQuestion.run(
                    topicId, chapterId, subjectId,
                    q.text,
                    q.options[0], q.options[1], q.options[2], q.options[3],
                    q.correct,
                    q.difficulty,
                    q.explanation,
                    q.year_asked || null,
                    q.tags || null
                );
            }
        }
    });
    seedQuestionsTransaction();

    // Count results
    const subjectCount = db.prepare('SELECT COUNT(*) as c FROM subjects').get().c;
    const chapterCount = db.prepare('SELECT COUNT(*) as c FROM chapters').get().c;
    const topicCount = db.prepare('SELECT COUNT(*) as c FROM topics').get().c;
    const questionCount = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`   📚 Subjects: ${subjectCount}`);
    console.log(`   📖 Chapters: ${chapterCount}`);
    console.log(`   📝 Topics: ${topicCount}`);
    console.log(`   ❓ Questions: ${questionCount}`);
}

seed();
