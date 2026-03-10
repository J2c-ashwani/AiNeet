import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function requireAdmin(request) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET(request) {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const supabase = getSupabase();
        const { data: users } = await supabase
            .from('users')
            .select('id, name, email, xp, subscription_tier, subscription_expires, created_at, role')
            .order('id', { ascending: false });

        return NextResponse.json({ users: users || [] });
    } catch (error) {
        console.error('Users API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
