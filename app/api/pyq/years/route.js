import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('questions')
            .select('year_asked')
            .not('year_asked', 'is', null)
            .neq('year_asked', '')
            .eq('is_pyq', 1)
            .order('year_asked', { ascending: false });

        if (error) throw error;

        // Extract unique years
        const yearsSet = new Set(data.map(row => row.year_asked));
        const years = Array.from(yearsSet);

        return NextResponse.json({ years });
    } catch (error) {
        console.error('Failed to fetch available PYQ years:', error);
        return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
    }
}
