import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { generateDoubtResponse } from '@/lib/ai-engine';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeString } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        // Rate limit: 20 AI doubt requests per minute per user
        const rl = rateLimit(`user:${decoded.id}:doubt`, 20, 60000);
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
        }

        const { message, conversationId } = await request.json();
        if (!message || typeof message !== 'string') return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        const cleanMessage = sanitizeString(message, 2000);
        if (cleanMessage.length < 2) return NextResponse.json({ error: 'Message is too short' }, { status: 400 });

        let convId = conversationId;
        if (!convId) {
            convId = uuidv4();
            const title = cleanMessage.length > 50 ? cleanMessage.substring(0, 50) + '...' : cleanMessage;
            await db.run('INSERT INTO doubt_conversations (id, user_id, title) VALUES (?, ?, ?)', [convId, decoded.id, title]);
        }

        await db.run('INSERT INTO doubt_messages (conversation_id, role, content) VALUES (?, ?, ?)', [convId, 'user', cleanMessage]);
        // Generate AI Response
        // For now, context is an empty object. It can be populated with relevant information later.
        const context = {};
        const aiResponse = await generateDoubtResponse(cleanMessage, context, decoded);

        // Save AI message
        await db.run(
            'INSERT INTO doubt_messages (conversation_id, role, content) VALUES (?, ?, ?)',
            [convId, 'assistant', aiResponse]
        );

        return NextResponse.json({ conversationId: convId, response: aiResponse });
    } catch (error) {
        console.error('Doubt error:', error);
        return NextResponse.json({ error: 'Failed to process doubt' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const convId = searchParams.get('conversationId');

        if (convId) {
            const messages = await db.all('SELECT * FROM doubt_messages WHERE conversation_id = ? ORDER BY created_at ASC', [convId]);
            return NextResponse.json({ messages });
        }

        const conversations = await db.all('SELECT * FROM doubt_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [decoded.id]);
        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Doubt GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch doubts' }, { status: 500 });
    }
}
