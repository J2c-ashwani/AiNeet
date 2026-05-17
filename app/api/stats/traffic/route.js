import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await getDb();

        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        return NextResponse.json({
            activeAspirants: count || 0,
            source: 'registered_users'
        }, {
            headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=3600' }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json({
            activeAspirants: 0,
            source: 'unavailable'
        }, { status: 503 });
    }
}
