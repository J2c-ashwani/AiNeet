import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabase();
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

            if (error) throw error;
            if (data.length > 0) {
                allData = allData.concat(data);
                offset += limit;
            }
            if (data.length < limit) {
                hasMore = false;
            }
        }

        // Extract unique 4-digit years using regex
        const yearsSet = new Set();
        allData.forEach(row => {
            if (row.year_asked) {
                const matches = row.year_asked.match(/\b(19|20)\d{2}\b/g);
                if (matches) {
                    matches.forEach(y => yearsSet.add(y));
                }
            }
        });

        // Sort descending
        const years = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));

        return NextResponse.json({ years });
    } catch (error) {
        console.error('Failed to fetch available PYQ years:', error);
        return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
    }
}
