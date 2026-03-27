import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
    const { count, data } = await supabase.from('questions')
        .select('id', { count: 'exact' })
        .eq('chapter_id', 37)
        .eq('is_pyq', 1);
    console.log("Count with select('id'):", count);
}
check();
