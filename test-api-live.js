require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testApi() {
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'jhasalcreativepeople@gmail.com',
        password: 'JaiShreeRam@123'
    });

    if (authError) {
        console.error('Login error:', authError);
        return;
    }

    const token = authData.session.access_token;
    console.log('Logged in. Token length:', token.length);

    console.log('Hitting production API...');
    const res = await fetch('https://ai-neet.vercel.app/api/subscription/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `sb-access-token=${token}; sb-refresh-token=dummy`
        },
        body: JSON.stringify({ planId: 'premium' })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
}

testApi();
