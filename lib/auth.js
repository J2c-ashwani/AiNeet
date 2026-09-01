import { getDb } from './core/db.js';
import * as Sentry from '@sentry/nextjs';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 * @property {number} [xp]
 */

/**
 * Strict Global Auth Gate.
 * Retrieves and validates the user securely from Bearer headers or request cookies.
 * @param {Request} request 
 * @returns {Promise<User | null>}
 */
export async function getUserFromRequest(request) {
    try {
        const authHeader = request.headers?.get ? request.headers.get('authorization') : null;
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        let user = null;
        const adminDb = await getDb();

        if (token) {
            const { data, error: authError } = await adminDb.auth.getUser(token);
            if (authError || !data?.user) {
                return null; // Invalid, expired, or malformed Bearer token
            }
            user = data.user;
        } else {
            const { createSupabaseServerClient } = await import('../utils/supabase/server.js');
            const supabase = await createSupabaseServerClient();
            const { data, error: authError } = await supabase.auth.getUser();
            if (authError || !data?.user) {
                return null; // No valid cookie session
            }
            user = data.user;
        }

        if (!user) return null;

        // Fetch user profile securely using backend DB access scoped strictly to the token's authenticated user.id
        const { data: profile, error: profileErr } = await adminDb
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
        // Log unexpected database errors (ignoring PGRST116 row not found)
        if (profileErr && profileErr.code !== 'PGRST116') {
            Sentry.captureException(profileErr);
        }

        if (profile && profile.account_status === 'deleted') {
            return null;
        }

        return {
            id: user.id,
            email: user.email || profile?.email || '',
            name: profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
            role: profile?.role || 'student',
            ...(profile || {})
        };
    } catch (error) {
        console.error('CRITICAL: Supabase Global get user error:', error);
        Sentry.captureException(error);
        return null;
    }
}
