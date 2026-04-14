import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';

export async function GET(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { data: badges } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', decoded.id)
            .order('earned_at', { ascending: false });

        return NextResponse.json({ badges: badges || [] });
    } catch (error) {
        console.error('Achievements error:', error);
        return NextResponse.json({ error: 'Failed to fetch achievements. Please try again in a moment.' }, { status: 500 });
    }
}
