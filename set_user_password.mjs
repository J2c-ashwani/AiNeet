
import { getDb } from './lib/db.js';
import { hashPassword } from './lib/auth.js';

const db = getDb();
const USER_ID = 'user_1';
const PASSWORD = 'password123';

console.log(`Setting password for ${USER_ID}...`);

const hash = hashPassword(PASSWORD);

db.prepare(`
    UPDATE users 
    SET password_hash = ?, email = 'test@example.com' 
    WHERE id = ?
`).run(hash, USER_ID);

console.log('✅ Password updated to: ' + PASSWORD);
