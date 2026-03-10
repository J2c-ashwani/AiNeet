import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSeed() {
    console.log("Checking seeded PYQs in Supabase...");

    const years = [2005, 2008, 2010, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
    let total = 0;

    console.log("\nPYQ Count by Year:");
    for (const year of years) {
        const { count, error } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('is_pyq', 1)
            .eq('year_asked', String(year));

        if (error) {
            console.error(`Error fetching count for ${year}:`, error.message);
            continue;
        }

        if (count > 0) {
            console.log(`  ${year}: ${count} questions`);
            total += count;
        }
    }

    const { count: totalPyqs } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_pyq', 1);

    console.log(`\nTotal PYQs in DB (from 'exact' count header): ${totalPyqs}`);
}

checkSeed().catch(console.error);
