// @ts-check
// Single Source of Truth for Database Connections
// MD Mandate: Enforces Service Role bypass for backend operations.

import { createClient } from '@supabase/supabase-js';

export async function getDb() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        throw new Error('Missing Supabase URL or SERVICE_ROLE_KEY inside secure backend context.');
    }

    // SSR backend exclusively operates via Service Role to bypass frontend RLS
    // It assumes business logic and RBAC have already been evaluated by getUserFromRequest.
    return createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
}
