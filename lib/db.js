import Database from 'better-sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Environment Configuration
let sqliteDb = null;
let pgPool = null;

function isPostgres() {
  return !!process.env.DATABASE_URL;
}

function initDb() {
  if (isPostgres() && !pgPool) {
    const dbUrl = process.env.DATABASE_URL;
    const protocolEnd = dbUrl.indexOf('://') + 3;
    const lastAt = dbUrl.lastIndexOf('@');
    const userPass = dbUrl.substring(protocolEnd, lastAt);
    const hostPart = dbUrl.substring(lastAt + 1);

    const colonIdx = userPass.indexOf(':');
    const user = userPass.substring(0, colonIdx);
    const password = decodeURIComponent(userPass.substring(colonIdx + 1));

    const [hostPort, database] = hostPart.split('/');
    const [host, port] = hostPort.split(':');

    pgPool = new Pool({
      user,
      password,
      host,
      port: parseInt(port),
      database,
      ssl: { rejectUnauthorized: false },
      max: 10 // Prevent connection exhaustion in serverless
    });
  } else if (!isPostgres() && !sqliteDb) {
    const dbPath = path.join(process.cwd(), 'neet-coach.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
}

/**
 * Helper: Convert 'SELECT * FROM x WHERE id = ?' to '... WHERE id = $1' for Postgres
 */
function normalizeSql(sql) {
  if (!isPostgres) return sql;
  let index = 1;
  // Replace ? with $1, $2, etc.
  let normalized = sql.replace(/\?/g, () => `$${index++}`);
  // Convert SQLite's INSERT OR IGNORE to PostgreSQL's ON CONFLICT DO NOTHING
  normalized = normalized.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
  // Append ON CONFLICT DO NOTHING if it was an INSERT OR IGNORE
  if (/INSERT\s+OR\s+IGNORE/i.test(sql)) {
    normalized = normalized.replace(/(VALUES\s*\([^)]+\))/, '$1 ON CONFLICT DO NOTHING');
  }
  return normalized;
}

const dbAdapter = {
  /**
   * Execute a query and return all rows
   * @returns {Promise<any[]>}
   */
  async all(sql, params = []) {
    initDb();
    if (isPostgres()) {
      const res = await pgPool.query(normalizeSql(sql), params);
      return res.rows;
    } else {
      return sqliteDb.prepare(sql).all(...params);
    }
  },

  /**
   * Execute a query and return the first row
   * @returns {Promise<any>}
   */
  async get(sql, params = []) {
    initDb();
    if (isPostgres()) {
      const res = await pgPool.query(normalizeSql(sql), params);
      return res.rows[0]; // undefined if no rows
    } else {
      return sqliteDb.prepare(sql).get(...params);
    }
  },

  /**
   * Execute a command (INSERT, UPDATE, DELETE)
   * @returns {Promise<{ changes: number, lastInsertRowid?: any }>}
   */
  async run(sql, params = []) {
    initDb();
    if (isPostgres()) {
      // Postgres doesn't return lastInsertID by default unless RETURNING is used
      // We just return rowCount here.

      // If the query is an INSERT and doesn't have RETURNING, we might miss ID.
      // But consumers of this adapter will be updated to handle that or use UUIDs (which we do mostly).
      const normalized = normalizeSql(sql);
      const res = await pgPool.query(normalized, params);

      // Try to extract ID if RETURNING id was used
      let id = null;
      if (res.rows.length > 0 && res.rows[0].id) {
        id = res.rows[0].id;
      }

      return { changes: res.rowCount, lastInsertRowid: id || 0 };
    } else {
      const info = sqliteDb.prepare(sql).run(...params);
      return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
  },

  /**
   * Execute raw SQL (for schema init, migrations)
   */
  async exec(sql) {
    initDb();
    if (isPostgres()) {
      await pgPool.query(sql);
    } else {
      sqliteDb.exec(sql);
    }
  },

  /**
   * Execute a transaction. Atomic in Postgres, best-effort in SQLite.
   */
  async transaction(fn) {
    initDb();
    if (isPostgres()) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      return await fn();
    }
  },

  /**
   * Close the database connection
   */
  async close() {
    if (isPostgres) await pgPool.end();
    else sqliteDb.close();
  },

  // Compatibility helper for 'prepare' pattern removal:
  prepare() {
    throw new Error("Synchronous db.prepare() is NOT supported in Production Mode. Use await db.get/all/run().");
  }
};

export function getDb() {
  return dbAdapter;
}
