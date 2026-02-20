
import { NextResponse } from 'next/server';
import { getDueReviews } from '@/lib/spaced_repetition';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const reviews = getDueReviews(decoded.id);
        return NextResponse.json({ reviews });
    } catch (error) {
        console.error('Revision Due Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
