require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const email = 'jhasalcreativepeople@gmail.com';
    console.log('Sending reset to:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/api/auth/callback?next=/update-password',
    });
    console.log('Result:', { data, error });
}
test();
