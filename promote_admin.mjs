
import { getDb } from './lib/db.js';

const db = getDb();
const email = process.argv[2];

if (!email) {
    console.error('Usage: node promote_admin.mjs <email>');
    process.exit(1);
}

try {
    const info = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
    if (info.changes > 0) {
        console.log(`User ${email} promoted to ADMIN.`);
    } else {
        console.log(`User ${email} not found.`);
    }
} catch (error) {
    console.error('Failed to promote user:', error);
}
