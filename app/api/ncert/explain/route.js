
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { sanitizeString } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { requireFeatureEnabled } from '@/lib/feature-flags';

export async function POST(request) {
    try {
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const featureDisabled = await requireFeatureEnabled('rag_explanations');
        if (featureDisabled) return featureDisabled;

        // Rate limit: 20 requests per minute per user
        const rl = await rateLimit(`user:${decoded.id}:explain`, 20, 60000, 'soft');
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { text, bookId } = _body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const cleanText = sanitizeString(text, 2000);
        if (cleanText.length < 2) {
            return NextResponse.json({ error: 'Text is too short' }, { status: 400 });
        }

        const cleanBookId = bookId ? sanitizeString(bookId, 128) : null;

        // Call AI Engine (RAG)
        const { callAIWithFallback } = await import('@/lib/ai-engine');

        const systemPrompt = `You are a helpful and expert NEET Coach. A student has highlighted the following text from an NCERT Biology/Physics/Chemistry textbook (Book ID: ${cleanBookId}). 
Please explain this concept simply but thoroughly, keeping in mind it is for the NEET exam. 
Format your response with:
1. A clear, easy-to-understand summary.
2. Any important keywords they must remember.
3. How this concept is typically tested in NEET (if applicable).
Keep it concise and format with basic Markdown.`;

        const aiResult = await callAIWithFallback(systemPrompt, `Highlighted Text: "${cleanText}"`);
        const explanationHtml = aiResult.text;

        return NextResponse.json({ explanation: explanationHtml });

    } catch (error) {
        console.error('Explain error:', error);
        return NextResponse.json({ error: 'Failed to explain. Please try again in a moment.' }, { status: 500 });
    }
}
