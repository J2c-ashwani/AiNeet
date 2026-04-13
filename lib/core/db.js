// @ts-check
// Single Source of Truth for Database Connections
// MD Mandate: Enforces per-request SSR client instantiation to eliminate memory leaks and caching errors.

import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function getDb() {
    return await createSupabaseServerClient();
}
