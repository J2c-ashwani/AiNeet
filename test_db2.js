const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
    const { data: cols, error: err1 } = await supabase.from('users').select('*').limit(1);
    console.log("DB Data:", cols);
    console.log("DB Error:", err1);
    
    // Simulate inserting what register API inserts
    const { error: err2 } = await supabase.from('users').insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        email: 'test@example.com',
        device_hash: '123',
        fraud_risk_score: 0
    });
    console.log("Insert Error:", err2);
}
test();
