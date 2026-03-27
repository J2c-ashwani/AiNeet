import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: chapters } = await supabase.from('chapters').select('id, name, class_level, subject_id');
    const { data: subjects } = await supabase.from('subjects').select('id, name');
    
    let subMap = {};
    for (const s of subjects) subMap[s.id] = s.name;

    console.log(`\n--- BIOLOGY PYQs BY CHAPTER ---`);
    let bioTotal = 0;
    
    for (let c of chapters) {
        if (subMap[c.subject_id] === 'Biology') {
            const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('chapter_id', c.id).eq('is_pyq', 1);
            console.log(`[Class ${c.class_level}] ${c.name}: ${count} PYQs`);
            bioTotal += count;
        }
    }
    console.log(`\nTotal Biology PYQs: ${bioTotal}`);
}

check();
