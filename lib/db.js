import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function convertQuery(sql) {
    let i = 1;
    // Replace ? with $1, $2, etc. (Not foolproof but works for simple prepared statements)
    return sql.replace(/\?/g, () => `$${i++}`);
}

export function getDb() {
    return {
        async get(sql, params = []) {
            const res = await pool.query(convertQuery(sql), params);
            return res.rows[0];
        },
        async all(sql, params = []) {
            const res = await pool.query(convertQuery(sql), params);
            return res.rows;
        },
        async run(sql, params = []) {
            const res = await pool.query(convertQuery(sql), params);
            // If the query had 'RETURNING id', we fake lastInsertRowid
            let lastId = null;
            if (res.rows && res.rows.length > 0 && res.rows[0].id) {
                lastId = res.rows[0].id;
            }
            return {
                lastInsertRowid: lastId,
                changes: res.rowCount
            };
        },
        async close() {
            // we don't really close it to keep it shared, or we can close it if it's script-level
            // Actually it's okay to do nothing here assuming scripts exit.
        }
    };
}
