import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.QA_USER_EMAIL;
const password = process.env.QA_USER_PASSWORD;

if (!supabaseUrl || !anonKey || !email || !password) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, QA_USER_EMAIL, and QA_USER_PASSWORD must be configured.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false }
});

async function main() {
    console.log(`Authenticating ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Authentication failed:', error.message);
        process.exit(1);
    }

    console.log('\nJWT_ACCESS_TOKEN:');
    console.log(data.session.access_token);
    console.log('\nCopy and run:');
    console.log(`LOAD_TEST_JWT="${data.session.access_token}" LOAD_TEST_BASE_URL="https://ai-neet.vercel.app" LOAD_TEST_ALLOW_PRODUCTION=true npm run test:load\n`);
}

main();
