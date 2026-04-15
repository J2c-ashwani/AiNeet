const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if(error) console.log("DB ERROR:", error);
    else console.log("DB OK, columns:", Object.keys(data[0] || {}).join(", "));
}
test();
