import { getDb } from './db.js';

export async function initializeDatabase() {
  const db = getDb();

  await db.exec(`
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
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      class_level INTEGER DEFAULT 11,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      weightage INTEGER DEFAULT 1,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      chapter_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
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
      FOREIGN KEY (topic_id) REFERENCES topics(id),
      FOREIGN KEY (chapter_id) REFERENCES chapters(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'custom' CHECK(type IN ('custom','topic','chapter','mock','practice','pyq')),
      config_json TEXT,
      total_questions INTEGER DEFAULT 0,
      total_marks INTEGER DEFAULT 0,
      score REAL,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      unanswered_count INTEGER DEFAULT 0,
      time_taken_seconds INTEGER DEFAULT 0,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS test_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT,
      is_correct INTEGER,
      time_spent_seconds INTEGER DEFAULT 0,
      is_marked INTEGER DEFAULT 0,
      FOREIGN KEY (test_id) REFERENCES tests(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS user_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      topic_id INTEGER NOT NULL,
      accuracy REAL DEFAULT 0,
      total_attempted INTEGER DEFAULT 0,
      total_correct INTEGER DEFAULT 0,
      avg_time_seconds REAL DEFAULT 0,
      last_attempted TEXT,
      UNIQUE(user_id, topic_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS doubt_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT DEFAULT 'New Chat',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS doubt_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES doubt_conversations(id)
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      description TEXT,
      earned_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_chapter_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      chapter_id INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 0,
      mastery_level REAL DEFAULT 0,
      UNIQUE(user_id, chapter_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );
    
    CREATE TABLE IF NOT EXISTS battle_elo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        elo_rating INTEGER DEFAULT 1200,
        matches_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS battles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        opponent_id TEXT,
        opponent_name TEXT,
        user_score INTEGER DEFAULT 0,
        opponent_score INTEGER DEFAULT 0,
        outcome TEXT, -- 'win', 'loss', 'draw'
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
     
    CREATE TABLE IF NOT EXISTS question_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        issue_type TEXT,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'pending', -- pending, completed, failed
        provider_payment_id TEXT,
        provider_order_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        month TEXT NOT NULL, -- Format: 'YYYY-MM'
        ai_test_count INTEGER DEFAULT 0,
        ai_doubt_count INTEGER DEFAULT 0,
        ncert_explain_count INTEGER DEFAULT 0,
        ai_tokens_used INTEGER DEFAULT 0,
        last_reset_date TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, month),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_response_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_hash TEXT UNIQUE NOT NULL,
        response TEXT NOT NULL,
        confidence_score INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT
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

    CREATE TABLE IF NOT EXISTS ncert_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER,
        chapter_id INTEGER,
        title TEXT,
        file_path TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ncert_books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER,
        chapter_id INTEGER,
        title TEXT,
        file_path TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS test_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        test_id TEXT,
        score REAL,
        accuracy REAL,
        completed_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
