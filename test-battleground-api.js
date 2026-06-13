require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testCreate() {
    console.log('Logging in as QA user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'qa@neetcoach.in',
        password: 'password123'
    });

    if (authError) {
        console.error('Login error:', authError);
        return;
    }

    const token = authData.session.access_token;
    console.log('Logged in. Hitting production battleground create API...');
    
    const res = await fetch('https://ai-neet.vercel.app/api/battleground/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cookie': `sb-access-token=${token}`
        },
        body: JSON.stringify({ questionCount: 20, timeLimitMinutes: 30 })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
}

testCreate();
