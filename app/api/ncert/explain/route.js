
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeString } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        // Rate limit: 20 requests per minute per user
        const rl = rateLimit(`user:${decoded.id}:explain`, 20, 60000);
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
        }

        const { text, bookId } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const cleanText = sanitizeString(text, 2000);
        if (cleanText.length < 2) {
            return NextResponse.json({ error: 'Text is too short' }, { status: 400 });
        }

        const cleanBookId = bookId ? sanitizeString(bookId, 128) : null;

        // Mock AI Logic
        // In production, call Google Gemini API here
        // const geminiResponse = await gemini.generateContent(prompt);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate latency

        const explanation = `
            **Concept Analysis:** "${cleanText}"
            
            This concept from Class 11 Physics relates to fundamental laws of nature.
            
            **Key Points:**
            1. Scientific Method: Observation to Theory.
            2. Reductionism vs Unification.
            
            **Related PYQ:**
            - "Which of the following forces is the weakest in nature?" (NEET 2018)
            
            *(Simulated AI Response - Connect Gemini API for real-time analysis)*
        `;

        return NextResponse.json({ explanation });

    } catch (error) {
        console.error('Explain error:', error);
        return NextResponse.json({ error: 'Failed to explain' }, { status: 500 });
    }
}
