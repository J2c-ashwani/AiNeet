/**
 * V2 Adaptive Learning Migration
 * 
 * This migration has been merged into lib/schema.js (initializeDatabase).
 * The following tables are now created automatically:
 * - user_topic_mastery
 * - question_difficulty_dynamic
 * 
 * This file is kept for reference but is no longer needed as a standalone migration.
 */

const { getDb } = require('../db');

function up() {
    console.log('Running v2 migration: Adaptive Learning Tables');
    const db = getDb();

    db.exec(`
        CREATE TABLE IF NOT EXISTS user_topic_mastery (
            user_id TEXT,
            topic_id TEXT,
            mastery_score REAL DEFAULT 0,
            confidence_score REAL DEFAULT 0,
            questions_attempted INTEGER DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, topic_id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS question_difficulty_dynamic (
            question_id TEXT PRIMARY KEY,
            difficulty_score REAL DEFAULT 1.0,
            attempts INTEGER DEFAULT 0,
            correct_attempts INTEGER DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('v2 migration completed');
}

function down() {
    console.log('Rolling back v2 migration');
    const db = getDb();
    db.exec('DROP TABLE IF EXISTS user_topic_mastery');
    db.exec('DROP TABLE IF EXISTS question_difficulty_dynamic');
}

module.exports = { up, down };
