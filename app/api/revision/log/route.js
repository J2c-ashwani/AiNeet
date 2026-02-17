
import { NextResponse } from 'next/server';
import { logReview } from '@/lib/spaced_repetition';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const { questionId, quality } = await request.json();

        const token = request.headers.get('Authorization')?.split(' ')[1];
        let userId = 'user_1';

        if (token) {
            const decoded = verifyToken(token);
            userId = decoded.id;
        }

        if (!questionId || quality === undefined) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const result = logReview(userId, questionId, quality);
        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error('Revision Log Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
