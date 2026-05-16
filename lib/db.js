import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { Pool } = pg;

let _pool = null;
function getPool() {
    if (!_pool) {
        _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    }
    return _pool;
}

function convertQuery(sql) {
    let i = 1;
    // Replace ? with $1, $2, etc. (Not foolproof but works for simple prepared statements)
    return sql.replace(/\?/g, () => `$${i++}`);
}

// Named export used by API routes directly
export async function query(sql, params = []) {
    const res = await getPool().query(convertQuery(sql), params);
    return res;
}

export function getDb() {
    return {
        async get(sql, params = []) {
            const res = await getPool().query(convertQuery(sql), params);
            return res.rows[0];
        },
        async all(sql, params = []) {
            const res = await getPool().query(convertQuery(sql), params);
            return res.rows;
        },
        async run(sql, params = []) {
            const res = await getPool().query(convertQuery(sql), params);
            let lastId = null;
            if (res.rows && res.rows.length > 0 && res.rows[0].id) {
                lastId = res.rows[0].id;
            }
            return {
                lastInsertRowid: lastId,
                changes: res.rowCount
            };
        },
        async close() {}
    };
}
