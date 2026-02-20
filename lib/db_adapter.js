/**
 * Database Adapter - Re-exports from the canonical db.js module.
 * 
 * This file originally contained a standalone Postgres/SQLite dual adapter.
 * Its methods (exec, transaction, close) have been merged into lib/db.js.
 * This re-export ensures any future imports of db_adapter.js use the canonical module.
 */
export { getDb } from './db.js';
export { getDb as db } from './db.js';
