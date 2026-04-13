import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { generateDoubtResponse } from '@/lib/ai-engine';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '@/lib/rate-limit';
import Tesseract from 'tesseract.js';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        // User Rate limit: 5 AI image requests per minute
        const rl = rateLimit(`user:${decoded.id}:doubt:image`, 5, 60000);
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many image requests. Please wait a moment.' }, { status: 429 });
        }

        const formData = await request.formData();
        const file = formData.get('image');
        let conversationId = formData.get('conversationId');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        // Convert Blob to ArrayBuffer for Tesseract
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[OCR Pre-flight] Running local Tesseract OCR on ${file.size} bytes...`);

        // 1. OCR Pre-flighting (Extract Text to save massive Gemini Vision API costs)
        let extractedText = '';
        try {
            const result = await Tesseract.recognize(buffer, 'eng', {
                logger: m => { } // suppress verbose logging
            });
            extractedText = result.data.text.trim();
            console.log(`[OCR] Extracted ${extractedText.length} characters.`);
        } catch (ocrError) {
            console.error('OCR Extraction failed:', ocrError);
            return NextResponse.json({ error: 'Failed to read text from image. Please ensure the image is clear and contains printed text.' }, { status: 400 });
        }

        if (extractedText.length < 5) {
            return NextResponse.json({
                error: 'Could not detect sufficient readable text in the image. Please upload a clearer photo of printed or distinctly handwritten text.'
            }, { status: 400 });
        }

        const cleanMessage = `[Image Content Extracted via OCR]\n\n${extractedText}\n\n[End Image Content]`;

        let convId = conversationId;
        if (!convId || convId === 'null') {
            convId = uuidv4();
            const title = 'Image Doubt: ' + (extractedText.length > 30 ? extractedText.substring(0, 30) + '...' : extractedText);
            await supabase.from('doubt_conversations').insert({ id: convId, user_id: decoded.id, title, created_at: new Date().toISOString() });
        }

        await supabase.from('doubt_messages').insert({
            conversation_id: convId,
            role: 'user',
            content: `Uploaded Image: (OCR Text Extracted)`,
            created_at: new Date().toISOString()
        });

        // 2. Generate AI Response using the extracted text rather than the heavy image payload
        const context = {};
        const aiResponse = await generateDoubtResponse(cleanMessage, context, decoded);

        // Save AI message
        await supabase.from('doubt_messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: aiResponse,
            created_at: new Date().toISOString()
        });

        return NextResponse.json({
            conversationId: convId,
            response: aiResponse,
            extractedText: extractedText // Return to UI so user knows what the AI actually "saw"
        });

    } catch (error) {
        console.error('Image Doubt error:', error);
        return NextResponse.json({ error: 'Failed to process image doubt' }, { status: 500 });
    }
}
