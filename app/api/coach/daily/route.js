
import { NextResponse } from 'next/server';
import { generateDailyGuidance } from '@/lib/ai_coach';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        let userId = 'user_1';

        if (token) {
            try {
                const decoded = verifyToken(token);
                userId = decoded.id;
            } catch (e) {
                // Token invalid, continue as demo user or return 401
                // For now, let's allow demo user fallback if no valid token
            }
        }

        const guidance = generateDailyGuidance(userId);

        if (!guidance) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(guidance);
    } catch (error) {
        console.error('Coach API Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
