
import { getDb } from './lib/db.js';
import { hashPassword } from './lib/auth.js';

const db = getDb();
const email = 'ashwani_success@example.com';
const password = 'admin123';

try {
    const hash = hashPassword(password);
    const info = db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(hash, email);
    if (info.changes > 0) {
        console.log(`Password for ${email} reset to '${password}'.`);
    } else {
        console.log(`User ${email} not found.`);
    }
} catch (error) {
    console.error('Failed to reset password:', error);
}
