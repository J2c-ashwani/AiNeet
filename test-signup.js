require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSignup() {
    const email = `test.otp.${Date.now()}@example.com`;
    console.log('Testing signup with:', email);
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password: 'Password123!',
    });
    
    console.log('Result:', { data, error });
}

testSignup();
