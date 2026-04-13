// @ts-check
// Authentication is now fully managed by Supabase SSR Single Source of Truth layer
import { createSupabaseServerClient } from '@/utils/supabase/server';
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
 * Retrieves and validates the user securely from the request cookies.
 * @param {Request} request 
 * @returns {Promise<User | null>}
 */
export async function getUserFromRequest(request) {
    try {
        const supabase = await createSupabaseServerClient();
        
        // Critical: Supabase throws structured errors natively on invalid cookies
        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
            return null; // Silent catch, standard unauthorized flow
        }

        const user = data.user;

        // Fetch remaining profile data
        const { data: profile, error: profileErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
        // If profile fetch hard-errors (e.g. timeout), log it but don't kill the auth completely
        if (profileErr && profileErr.code !== 'PGRST116') {
            Sentry.captureException(profileErr);
        }

        if (profile) {
            return {
                id: user.id,
                email: user.email,
                name: profile.name,
                role: profile.role || 'student',
                ...profile
            }
        }

        return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || 'User',
            role: 'student'
        }
    } catch (error) {
        // MD Guard: Catch total system panics (Redis offline, DB offline) and monitor it
        console.error('CRITICAL: Supabase Global get user error:', error);
        Sentry.captureException(error);
        return null;
    }
}
