import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { generateDoubtResponse } from '@/lib/ai-engine';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { message, conversationId } = await request.json();
        if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        let convId = conversationId;
        if (!convId) {
            convId = uuidv4();
            const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
            db.prepare('INSERT INTO doubt_conversations (id, user_id, title) VALUES (?, ?, ?)').run(convId, decoded.id, title);
        }

        db.prepare('INSERT INTO doubt_messages (conversation_id, role, content) VALUES (?, ?, ?)').run(convId, 'user', message);
        const aiResponse = generateDoubtResponse(message);
        db.prepare('INSERT INTO doubt_messages (conversation_id, role, content) VALUES (?, ?, ?)').run(convId, 'assistant', aiResponse);

        return NextResponse.json({ conversationId: convId, response: aiResponse });
    } catch (error) {
        console.error('Doubt error:', error);
        return NextResponse.json({ error: 'Failed to process doubt' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const convId = searchParams.get('conversationId');

        if (convId) {
            const messages = db.prepare('SELECT * FROM doubt_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId);
            return NextResponse.json({ messages });
        }

        const conversations = db.prepare('SELECT * FROM doubt_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(decoded.id);
        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Doubt GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch doubts' }, { status: 500 });
    }
}
