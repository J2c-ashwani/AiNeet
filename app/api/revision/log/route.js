
import { NextResponse } from 'next/server';
import { logReview } from '@/lib/spaced_repetition';
import { getUserFromRequest } from '@/lib/auth';
import { validateId, validatePositiveInt } from '@/lib/validate';

export async function POST(request) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { questionId, quality } = await request.json();

        if (!questionId || !validateId(questionId)) {
            return NextResponse.json({ error: 'Valid question ID is required' }, { status: 400 });
        }

        // quality must be 0–5 (SM-2 algorithm scale)
        const qualityVal = validatePositiveInt(quality, 0, 5);
        if (qualityVal === false) {
            return NextResponse.json({ error: 'Quality must be an integer 0–5' }, { status: 400 });
        }

        const result = logReview(decoded.id, questionId, qualityVal);
        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error('Revision Log Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
