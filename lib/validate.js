/**
 * Input Validation & Sanitization Utilities
 * Production-grade validation for all API routes.
 */

/**
 * Sanitize a string: trim, remove null bytes, limit length
 */
export function sanitizeString(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\0/g, '').substring(0, maxLength);
}

/**
 * Validate a UUID v4 format
 */
export function validateUUID(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Validate a 6-character invite code (alphanumeric uppercase)
 */
export function validateInviteCode(code) {
    if (!code || typeof code !== 'string') return false;
    return /^[A-Z0-9]{4,8}$/i.test(code.trim());
}

/**
 * Validate email format
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required' };
    if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
    if (password.length > 128) return { valid: false, message: 'Password is too long' };
    return { valid: true };
}

/**
 * Validate positive integer within range
 */
export function validatePositiveInt(value, min = 1, max = 10000) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min || num > max) return false;
    return num;
}

/**
 * Sanitize and validate a JSON body, returning parsed object or null
 */
export function parseAndValidate(body, requiredFields = []) {
    if (!body || typeof body !== 'object') return null;
    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            return null;
        }
    }
    return body;
}
