import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { getLevelFromXP } from '@/lib/scoring';

export async function GET(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ user: null });

        const { data: user } = await supabase
            .from('users')
            .select('id, name, email, xp, level, streak, target_year, daily_goal, avatar')
            .eq('id', decoded.id)
            .single();

        if (!user) return NextResponse.json({ user: null });

        const levelInfo = getLevelFromXP(user.xp);
        return NextResponse.json({ user: { ...user, levelInfo } });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json({ user: null });
    }
}

export async function PUT(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { name, targetYear, dailyGoal, password } = _body;

        const updates = {};

        if (name) updates.name = name;
        if (targetYear) updates.target_year = targetYear;
        if (dailyGoal) updates.daily_goal = dailyGoal;
        if (password) {
            // Update auth password
            const { error: pwdError } = await supabase.auth.updateUser({ password });
            if (pwdError) throw pwdError;
        }

        if (Object.keys(updates).length === 0) return NextResponse.json({ success: true });

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', decoded.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
