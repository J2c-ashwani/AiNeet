import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { generateDoubtResponse } from '@/lib/ai-engine';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeString } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/error-logger';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        // Rate limit: 20 AI doubt requests per minute per user
        const rl = rateLimit(`user:${decoded.id}:doubt`, 20, 60000);
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
            convId = uuidv4();
            const title = cleanMessage.length > 50 ? cleanMessage.substring(0, 50) + '...' : cleanMessage;
            await supabase.from('doubt_conversations').insert({ id: convId, user_id: decoded.id, title, created_at: new Date().toISOString() });
        }

        await supabase.from('doubt_messages').insert({ conversation_id: convId, role: 'user', content: cleanMessage, created_at: new Date().toISOString() });
        // Generate AI Response
        // For now, context is an empty object. It can be populated with relevant information later.
        const context = {};
        const aiResponse = await generateDoubtResponse(cleanMessage, context, decoded);

        // Save AI message
        await supabase.from('doubt_messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: aiResponse,
            created_at: new Date().toISOString()
        });

        return NextResponse.json({ conversationId: convId, response: aiResponse });
    } catch (error) {
        console.error('Doubt error:', error);
        const supabase = await getDb();
        await logError(supabase, { userId: decoded?.id, route: '/api/doubt', method: 'POST', error });
        return NextResponse.json({ error: 'Failed to process doubt. Please try again in a moment.' }, { status: 500 });
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
