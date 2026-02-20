
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Environment Configuration
const isPostgres = !!process.env.DATABASE_URL;
let sqliteDb;
let pgPool;

if (isPostgres) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // SQLite Setup
  // Ensure data directory exists if we are in a weird env, but typically we are in root
  const dbPath = path.join(process.cwd(), 'neet-coach.db');
  if (!sqliteDb) {
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
  // Replace ? with $1, $2, etc. (naive implementation, assumes no ? in strings)
  // A more robust parser would be better, but for this app it suffices if we are careful.
  return sql.replace(/\?/g, () => `$${index++}`);
}

const dbAdapter = {
  /**
   * Execute a query and return all rows
   * @returns {Promise<any[]>}
   */
  async all(sql, params = []) {
    if (isPostgres) {
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
    if (isPostgres) {
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
    if (isPostgres) {
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
    if (isPostgres) {
      await pgPool.query(sql);
    } else {
      sqliteDb.exec(sql);
    }
  },

  /**
   * Execute a transaction. Atomic in Postgres, best-effort in SQLite.
   */
  async transaction(fn) {
    if (isPostgres) {
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
