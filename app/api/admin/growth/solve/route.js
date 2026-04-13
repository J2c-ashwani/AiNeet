import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDb } from '@/lib/core/db';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extremely strict auth: For a real production app, ensure user.role === 'admin'
        // For staging we will allow any authenticated session but ideally protected.

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { textContent, imageBase64, mimeType } = _body;

        if (!textContent && !imageBase64) {
            return NextResponse.json({ error: 'Provide at least text or an image' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using flash to keep generation blazing fast (sub 2 seconds) for the Copilot workflow
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are the founder of NEET Coach. Your job is to answer a student's Biology/Physics/Chemistry doubt found on social media. 
            The goal is extreme platform-compliance and high-trust human tone. DO NOT sound like an AI. Treat the student like a smart peer.
            
            Based on the image/text provided, figure out what the student is confused about.
            Then formulate 3 different variations of a response.
            
            Every single response MUST natively embed:
            1. An "Engagement Hook" near the end (e.g. "Did you get where this went wrong?", "Which step confused you?")
            2. A "Soft CTA" (e.g. "I built a free tool to track these exact traps. Happy to share if you want.", "There's a free tracker I use for this, let me know if you want the link.")
            
            Return ONLY a raw JSON string (no markdown ticks around the json, just the raw json structure) containing:
            {
               "topic_detected": "e.g., Thermodynamics",
               "concise": "A very short, punchy 2-3 sentence answer + Hook + Soft CTA",
               "detailed": "A 5-6 sentence step-by-step breakdown + Hook + Soft CTA",
               "conversational": "A very casual, empathetic response starting with 'Most students mess up this exact step 👇' + Hook + Soft CTA"
            }
        `;

        let result;
        if (imageBase64) {
            const imagePart = { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } };
            result = await model.generateContent([prompt, textContent || "What is the answer to this doubt?", imagePart]);
        } else {
            result = await model.generateContent([prompt, textContent]);
        }

        const rawOutput = await result.response.text();
        
        let parsedPayload;
        try {
            // Strip any rogue Markdown ticks the AI might have still returned
            const cleanRaw = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            parsedPayload = JSON.parse(cleanRaw);
        } catch (e) {
            console.error("Failed to parse Gemini Vision output:", rawOutput);
            return NextResponse.json({ error: 'AI Output Malformed' }, { status: 500 });
        }

        return NextResponse.json(parsedPayload);
        
    } catch (error) {
        console.error("Growth Copilot Execution Error:", error);
        return NextResponse.json({ error: 'Internal API Server Error' }, { status: 500 });
    }
}
