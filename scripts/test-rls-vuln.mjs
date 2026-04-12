import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testRLS() {
    console.log('Testing RLS bypass vulnerability...');
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
    );

    // Provide an invalid ID so we don't accidentally update a real user, 
    // but observe if the database rejects the action or just says "0 rows updated"
    const { data, error, count } = await supabase
        .from('users')
        .update({ subscription_tier: 'pro' })
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .select();

    if (error) {
         console.log('Test result: SECURE (or other error).', error);
    } else {
         console.log('Test result: VULNERABLE. The ANON key is allowed to run UPDATE commands.');
         console.log('Data returned:', data);
    }
}

testRLS();
