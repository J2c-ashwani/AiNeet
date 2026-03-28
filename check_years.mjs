import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkYears() {
    let allData = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
        const { data, error } = await supabase
            .from('questions')
            .select('year_asked')
            .not('year_asked', 'is', null)
            .neq('year_asked', '')
            .eq('is_pyq', 1)
            .range(offset, offset + limit - 1);

        if (error) { console.error("DB Error:", error); return; }
        if (data.length > 0) { allData = allData.concat(data); offset += limit; }
        if (data.length < limit) { hasMore = false; }
    }

    const yearsSet = new Set();
    allData.forEach(row => {
        if (row.year_asked) {
            const matches = row.year_asked.match(/\b(19|20)\d{2}\b/g);
            if (matches) { matches.forEach(y => yearsSet.add(y)); }
        }
    });

    const parsedYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));
    console.log(parsedYears.join(", "));
}

checkYears();
