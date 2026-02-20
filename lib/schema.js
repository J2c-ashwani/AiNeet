import { getDb } from './db.js';

export async function initializeDatabase() {
  const db = getDb();

  // Detect if we're using PostgreSQL (DATABASE_URL is set)
  const isPostgres = !!process.env.DATABASE_URL;

  if (isPostgres) {
    // PostgreSQL schema — tables are created by seed-postgres.js
    // This just ensures tables exist if seed hasn't run yet
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
        subscription_tier TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
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
        difficulty TEXT NOT NULL DEFAULT 'medium',
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
        type TEXT NOT NULL DEFAULT 'custom',
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
        role TEXT NOT NULL,
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
  } else {
    // SQLite schema (original)
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
        role TEXT DEFAULT 'student',
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        battle_elo INTEGER DEFAULT 1000,
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
        outcome TEXT,
        elo_change INTEGER DEFAULT 0,
        questions TEXT,
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
        status TEXT DEFAULT 'pending',
        provider_payment_id TEXT,
        provider_order_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS user_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        month TEXT NOT NULL,
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

      CREATE TABLE IF NOT EXISTS revision_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        question_id INTEGER REFERENCES questions(id),
        easiness_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review_at TEXT,
        last_reviewed_at TEXT,
        UNIQUE(user_id, question_id)
      );

      CREATE TABLE IF NOT EXISTS mistake_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        question_id INTEGER REFERENCES questions(id),
        test_id TEXT,
        selected_option TEXT,
        correct_option TEXT,
        logged_at TEXT DEFAULT (datetime('now'))
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
        created_at TEXT DEFAULT (datetime('now')),
        started_at TEXT
      );

      CREATE TABLE IF NOT EXISTS battleground_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT REFERENCES battleground_rooms(id),
        user_id TEXT NOT NULL,
        user_name TEXT,
        score INTEGER DEFAULT 0,
        answers TEXT DEFAULT '[]',
        finished INTEGER DEFAULT 0,
        joined_at TEXT DEFAULT (datetime('now')),
        UNIQUE(room_id, user_id)
      );
    `);
  }
}
