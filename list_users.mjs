
import { getDb } from './lib/db.js';
const db = getDb();
const users = db.prepare('SELECT id, name, email, role FROM users').all();
console.log(users);
