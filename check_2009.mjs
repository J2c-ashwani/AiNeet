import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking 2009...");
    const { data, error, count } = await supabase
        .from('questions')
        .select('*', { count: 'exact' })
        .ilike('year_asked', '%2009%');
        
    if (error) console.error("Error:", error);
    console.log("Total 2009 questions:", count);
}
check();
