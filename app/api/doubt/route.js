import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeInsert } from '@/lib/core/db-safe';
import { generateDoubtResponse } from '@/lib/ai-engine';
import { randomUUID } from 'crypto';
import { sanitizeString } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/error-logger';
import { requireFeatureEnabled } from '@/lib/feature-flags';

export async function POST(request) {
    let decoded = null;
    try {
        decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const featureDisabled = await requireFeatureEnabled('ai_generation');
        if (featureDisabled) return featureDisabled;

        // Rate limit: 20 AI doubt requests per minute per user
        const rl = await rateLimit(`user:${decoded.id}:doubt`, 20, 60000, 'soft');
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { message, conversationId } = _body;
        if (!message || typeof message !== 'string') return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        const cleanMessage = sanitizeString(message, 2000);
        if (cleanMessage.length < 2) return NextResponse.json({ error: 'Message is too short' }, { status: 400 });

        let convId = conversationId;
        if (!convId) {
            convId = randomUUID();
            const title = cleanMessage.length > 50 ? cleanMessage.substring(0, 50) + '...' : cleanMessage;
            await safeInsert('doubt_conversations', {
                id: convId,
                user_id: decoded.id,
                title,
                created_at: new Date().toISOString(),
            }, {
                route: '/api/doubt',
                userId: decoded.id,
            });
        }

        await safeInsert('doubt_messages', {
            conversation_id: convId,
            role: 'user',
            content: cleanMessage,
            created_at: new Date().toISOString(),
        }, {
            route: '/api/doubt',
            userId: decoded.id,
        });
        // Generate AI Response
        // For now, context is an empty object. It can be populated with relevant information later.
        const context = {};
        const aiResponse = await generateDoubtResponse(cleanMessage, context, decoded);

        // Save AI message
        await safeInsert('doubt_messages', {
            conversation_id: convId,
            role: 'assistant',
            content: aiResponse,
            created_at: new Date().toISOString()
        }, {
            route: '/api/doubt',
            userId: decoded.id,
        });

        return NextResponse.json({ conversationId: convId, response: aiResponse });
    } catch (error) {
        console.error('Doubt error:', error);
        // P0-4: Isolated logging — logger crash must never mask primary error
        try {
            const supabase = await getDb();
            await logError(supabase, { userId: decoded?.id, route: '/api/doubt', method: 'POST', error });
        } catch (logErr) {
            console.error('[DOUBT_LOGGER_FAILED]', logErr.message);
        }
        return NextResponse.json({ error: 'Our AI is a little overloaded right now. Please try again in a moment.' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const convId = searchParams.get('conversationId');

        if (convId) {
            const { data: messages } = await supabase.from('doubt_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
            return NextResponse.json({ messages: messages || [] });
        }

        const { data: conversations } = await supabase.from('doubt_conversations').select('*').eq('user_id', decoded.id).order('created_at', { ascending: false }).limit(20);
        return NextResponse.json({ conversations: conversations || [] });
    } catch (error) {
        console.error('Doubt GET error:', error);
        const supabase = await getDb();
        await logError(supabase, { route: '/api/doubt', method: 'GET', error });
        return NextResponse.json({ error: 'Failed to fetch doubts. Please try again in a moment.' }, { status: 500 });
    }
}
