import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start with insecure defaults.');
}
const JWT_EXPIRY = '7d';

export function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

export function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role || 'student' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getUserFromRequest(request) {
    const cookie = request.headers.get('cookie') || '';
    const tokenMatch = cookie.match(/token=([^;]+)/);
    if (!tokenMatch) return null;
    return verifyToken(tokenMatch[1]);
}
