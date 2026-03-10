import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { getLevelFromXP } from '@/lib/scoring';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
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
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { name, targetYear, dailyGoal, password } = await request.json();

        const updates = {};

        if (name) updates.name = name;
        if (targetYear) updates.target_year = targetYear;
        if (dailyGoal) updates.daily_goal = dailyGoal;
        if (password) {
            updates.password_hash = await bcrypt.hash(password, 10);
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
