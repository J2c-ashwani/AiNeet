const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
    const passwordHash = crypto.createHash('sha256').update("Password123!").digest('hex');
    const { error: err2 } = await supabase.from('users').insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        email: 'test_insert@example.com',
        password_hash: passwordHash,
        target_year: 2026,
        fraud_risk_score: 0
    });
    console.log("Insert Error:", err2);
}
test();
