
import { getDb } from './lib/db.js';
import { updateUserMastery, updateQuestionDifficulty, getAdaptiveQuestion } from './lib/adaptive_engine.js';

// Setup Test Data
const db = getDb();
console.log('--- Starting Adaptive Engine Verification ---');

// 1. Create Test User & Data
const TEST_USER_ID = 'verify_adaptive_user';
const TEST_SUBJECT_ID = 999;
const TEST_CHAPTER_ID = 999;
const TEST_TOPIC_ID = 999;

db.prepare(`INSERT OR REPLACE INTO users (id, name, email, password_hash) VALUES (?, 'Test User', 'test@adaptive.com', 'hash')`).run(TEST_USER_ID);
// Insert Hierarchy
db.prepare(`INSERT OR REPLACE INTO subjects (id, name) VALUES (?, 'Adaptive Test Subject')`).run(TEST_SUBJECT_ID);
db.prepare(`INSERT OR REPLACE INTO chapters (id, subject_id, name) VALUES (?, ?, 'Adaptive Chapter')`).run(TEST_CHAPTER_ID, TEST_SUBJECT_ID);
db.prepare(`INSERT OR REPLACE INTO topics (id, chapter_id, name) VALUES (?, ?, 'Adaptive Topic')`).run(TEST_TOPIC_ID, TEST_CHAPTER_ID);

// Mock questions
// Q1: Difficulty 1200
// Q2: Difficulty 1320 (Ideal for 1300 mastery)
// Q3: Difficulty 1400
db.prepare(`INSERT OR REPLACE INTO questions (id, topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option) VALUES (9001, ?, ?, ?, 'Q1 Easy', 'A', 'B', 'C', 'D', 'A')`).run(TEST_TOPIC_ID, TEST_CHAPTER_ID, TEST_SUBJECT_ID);
db.prepare(`INSERT OR REPLACE INTO questions (id, topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option) VALUES (9002, ?, ?, ?, 'Q2 Medium', 'A', 'B', 'C', 'D', 'A')`).run(TEST_TOPIC_ID, TEST_CHAPTER_ID, TEST_SUBJECT_ID);
db.prepare(`INSERT OR REPLACE INTO questions (id, topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option) VALUES (9003, ?, ?, ?, 'Q3 Hard', 'A', 'B', 'C', 'D', 'A')`).run(TEST_TOPIC_ID, TEST_CHAPTER_ID, TEST_SUBJECT_ID);

db.prepare(`INSERT OR REPLACE INTO question_difficulty_dynamic (question_id, difficulty_score) VALUES ('9001', 1200)`).run();
db.prepare(`INSERT OR REPLACE INTO question_difficulty_dynamic (question_id, difficulty_score) VALUES ('9002', 1320)`).run();
db.prepare(`INSERT OR REPLACE INTO question_difficulty_dynamic (question_id, difficulty_score) VALUES ('9003', 1400)`).run();

// Log initial state
console.log('Test Data Seeded.');

// 2. Set User Mastery to 1300
db.prepare(`INSERT OR REPLACE INTO user_topic_mastery (user_id, topic_id, mastery_score) VALUES (?, ?, 1300)`).run(TEST_USER_ID, TEST_TOPIC_ID);
console.log('User Mastery set to 1300.');

// 3. Get Adaptive Question
// Target difficulty = 1300 + 20 = 1320. Should pick Q9002 (1320).
const q = getAdaptiveQuestion(TEST_USER_ID, TEST_SUBJECT_ID, TEST_TOPIC_ID);
console.log(`Selected Question: ${q.id} (Difficulty: ${q.difficulty})`);

if (q.id == 9002) {
    console.log('✅ SUCCESS: Perfectly matched difficulty selected.');
} else {
    console.error('❌ FAIL: Selected suboptimal question.');
}

// 4. Update Mastery (Correct Answer)
// User (1300) beats Question (1320). Expected score < 0.5. Actual = 1.
// Mastery should increase significantly. Question difficulty should decrease.
const newMastery = updateUserMastery(TEST_USER_ID, TEST_TOPIC_ID, true, 1320);
const newDiff = updateQuestionDifficulty(9002, true, 1300);

console.log(`New User Mastery: ${newMastery.toFixed(2)} (Was 1300)`);
console.log(`New Question Difficulty: ${newDiff.toFixed(2)} (Was 1320)`);

if (newMastery > 1300 && newDiff < 1320) {
    console.log('✅ SUCCESS: Elo update logic working correctly.');
} else {
    console.error('❌ FAIL: Elo update logic erroneous.');
}

// Cleanup
db.prepare('DELETE FROM users WHERE id = ?').run(TEST_USER_ID);
db.prepare('DELETE FROM questions WHERE id IN (9001, 9002, 9003)').run();
db.prepare('DELETE FROM question_difficulty_dynamic WHERE question_id IN (9001, 9002, 9003)').run();
db.prepare('DELETE FROM user_topic_mastery WHERE user_id = ?').run(TEST_USER_ID);
console.log('Cleanup Complete.');
