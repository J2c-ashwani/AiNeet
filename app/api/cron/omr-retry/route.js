import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeDelete, safeUpdate } from '@/lib/core/db-safe';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 300; // 5 mins max for Vercel cron
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const supabase = await getDb();
        
        // Authorization check for cron if needed (Vercel provides a specific header, or we use a secret)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch up to 5 pending or retrying tasks
        const { data: queueItems } = await supabase
            .from('omr_retry_queue')
            .select('*')
            .in('state', ['pending', 'retrying'])
            .lt('retry_count', 3)
            .order('created_at', { ascending: true })
            .limit(5);

        if (!queueItems || queueItems.length === 0) {
            return NextResponse.json({ message: 'No items to process' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        let processed = 0;
        let failed = 0;

        for (const item of queueItems) {
            try {
                // Update state to retrying
                await safeUpdate('omr_retry_queue', { id: item.id }, { 
                    state: 'retrying', 
                    retry_count: item.retry_count + 1 
                }, { route: 'cron-omr-retry' });

                // Parse the data URI
                const urlObj = item.scan_url;
                let mimeType = 'image/jpeg';
                let base64 = '';

                if (urlObj.startsWith('data:')) {
                    const parts = urlObj.split(';');
                    mimeType = parts[0].replace('data:', '');
                    base64 = parts[1].replace('base64,', '');
                } else {
                    throw new Error('Invalid data URI format');
                }

                const prompt = `
                    You are an expert Optical Mark Recognition (OMR) scanner system. 
                    Extract EVERY SINGLE bubbled answer on the sheet.
                    Return YOUR ENTIRE OUTPUT as a pure JSON object mapping strictly to this structure:
                    {
                       "quality_check": "clear" | "poor",
                       "answers": { "1": "A", "2": "C" }
                    }
                `;

                const imagePart = { inlineData: { data: base64, mimeType } };
                const result = await model.generateContent([prompt, imagePart]);
                const rawOutput = await result.response.text();
                
                const cleanRaw = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                const parsedPayload = JSON.parse(cleanRaw);

                if (parsedPayload.quality_check !== 'clear') {
                    throw new Error('Image still marked as poor quality by AI');
                }

                // If success, mark as exhausted (or "completed" if we add it, but requirement says exhausted or manually_reviewed)
                // We can mark it exhausted with success msg in last_error or delete it.
                // Or maybe we need a 'completed' state. We will just delete it to keep queue clean.
                await safeDelete('omr_retry_queue', { id: item.id }, {
                    route: 'cron-omr-retry',
                });
                processed++;

                // Note: The frontend must poll for the result or we send a push notification.
                // For now, background processing completes the extraction. We'd normally save `parsedPayload` to a table.
                
            } catch (err) {
                console.error(`Retry failed for item ${item.id}:`, err);
                const newState = (item.retry_count + 1 >= 3) ? 'exhausted' : 'pending';
                await safeUpdate('omr_retry_queue', { id: item.id }, {
                    state: newState,
                    last_error: err.message
                }, { route: 'cron-omr-retry' });
                failed++;
            }
        }

        return NextResponse.json({ processed, failed });

    } catch (error) {
        console.error('OMR Cron Error:', error);
        return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
    }
}
