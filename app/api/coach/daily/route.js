
import { NextResponse } from 'next/server';
import { generateDailyGuidance } from '@/lib/ai_coach';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const guidance = await generateDailyGuidance(decoded.id);

        if (!guidance) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(guidance);
    } catch (error) {
        console.error('Coach API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch daily guidance' }, { status: 500 });
    }
}
