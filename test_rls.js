require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runRLSTest() {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Simulate standard frontend student application
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    const email = `rls_hacker_${Date.now()}@example.com`;
    const password = 'HackerPassword123!';

    console.log('[RLS PEN-TEST] Registering new dummy student...');
    // Register as a normal student using normal frontend APIs
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email, password
    });

    if (signUpErr) {
        console.error('[RLS PEN-TEST] Failed to register:', signUpErr);
        return;
    }

    const userId = signUpData.user.id;
    // Wait for the public.users trigger to create the profile row
    await new Promise(r => setTimeout(r, 2000));

    // Get the active Bearer token just like a browser does
    const { data: sessionData } = await supabase.auth.getSession();
    const bearerToken = sessionData.session.access_token;
    
    console.log(`[RLS PEN-TEST] Acquired active Bearer token for user ${userId}`);
    
    // --- ATTACK VECTOR 1: Attempt to grant Self-Premium ---
    console.log('\n[RLS PEN-TEST] ATTACK VECTOR 1: Illegally modify subscription_tier to PRO');
    
    const exploitResponse1 = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            subscription_tier: 'pro',
            subscription_status: 'active'
        })
    });

    const exploitResult1 = await exploitResponse1.json();
    console.log(`[RLS RESULT 1] HTTP Status: ${exploitResponse1.status}`);
    console.log(exploitResult1);

    // --- ATTACK VECTOR 2: Attempt to artificially inject 9999 XP ---
    console.log('\n[RLS PEN-TEST] ATTACK VECTOR 2: Illegally modify xp to 999999');
    
    const exploitResponse2 = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ xp: 999999 })
    });

    const exploitResult2 = await exploitResponse2.json();
    console.log(`[RLS RESULT 2] HTTP Status: ${exploitResponse2.status}`);
    console.log(exploitResult2);
    
    // --- AUDIT RESULT ---
    console.log('\n[RLS PEN-TEST SUMMARY]');
    
    // Use an Admin Client to physically verify the database truth state
    const adminSupabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: finalDbState } = await adminSupabase.from('users').select('xp, subscription_tier').eq('id', userId).single();
    
    console.log(`[DB TRUTH STATE] XP: ${finalDbState?.xp}, Tier: ${finalDbState?.subscription_tier}`);

    if (finalDbState?.xp === 999999 || finalDbState?.subscription_tier === 'pro') {
        console.error('❌ FATAL VULNERABILITY DETECTED! RLS POLICIES ARE WEAK OR MISSING. USER CAN MUTATE OWN SECURE FIELDS.');
    } else {
        console.log('✅ SYSTEM SECURE! RLS Policies cleanly blocked malicious self-mutations (PostgREST returned 200 but 0 rows mutated).');
    }
}

runRLSTest();
