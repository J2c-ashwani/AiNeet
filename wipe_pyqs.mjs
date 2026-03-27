import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipePyqs() {
    console.log('🗑️  Wiping all PYQ questions from Supabase...');
    const { error } = await supabase.from('questions').delete().eq('is_pyq', 1);
    if (error) {
        console.error('Error wiping PYQs:', error);
    } else {
        console.log('✅ Successfully deleted all PYQs.');
    }
}

wipePyqs();
