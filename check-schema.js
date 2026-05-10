require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('tests').select('*').limit(1);
    if (error) {
        console.error('Schema error:', error);
    } else {
        if (data.length > 0) {
            console.log('Test schema columns:', Object.keys(data[0]));
        } else {
            console.log('No tests found to infer schema.');
        }
    }
}

checkSchema();
