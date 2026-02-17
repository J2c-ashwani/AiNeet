
import { getDb } from './lib/db.js';

function up() {
    console.log('Running v2 migration: Adaptive Learning Tables');
    const db = getDb();

    // 1. User Topic Mastery
    db.prepare(`
        CREATE TABLE IF NOT EXISTS user_topic_mastery (
            user_id TEXT,
            topic_id TEXT,
            mastery_score REAL DEFAULT 0, -- 0 to 100
            confidence_score REAL DEFAULT 0, -- 0 to 1 (reliability of the score)
            questions_attempted INTEGER DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, topic_id)
        )
    `).run();

    // 2. Dynamic Question Difficulty
    db.prepare(`
        CREATE TABLE IF NOT EXISTS question_difficulty_dynamic (
            question_id TEXT PRIMARY KEY,
            difficulty_score REAL DEFAULT 1.0, -- Elo rating, default 1.0 (medium)
            attempts INTEGER DEFAULT 0,
            correct_attempts INTEGER DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    console.log('v2 migration completed');
}

up();
