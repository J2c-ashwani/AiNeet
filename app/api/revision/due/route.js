
import { NextResponse } from 'next/server';
import { getDueReviews } from '@/lib/spaced_repetition';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        let userId = 'user_1'; // Default fallback for dev/demo

        if (token) {
            try {
                const decoded = verifyToken(token);
                userId = decoded.id;
            } catch (e) {
                // Invalid token, but maybe we allow demo user?
                // For now, if token exists but invalid, return 401
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
        }

        const reviews = getDueReviews(userId);
        return NextResponse.json({ reviews });
    } catch (error) {
        console.error('Revision Due Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
