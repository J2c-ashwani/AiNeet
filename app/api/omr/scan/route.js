import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { imageBase64, mimeType, testId } = await request.json();

        if (!imageBase64 || !testId) {
            return NextResponse.json({ error: 'Missing image or test ID' }, { status: 400 });
        }

        // Fetch the target offline test to know how many questions we expect to grade
        const { data: testData } = await supabase.from('offline_tests').select('total_questions').eq('id', testId).single();
        if (!testData) return NextResponse.json({ error: 'Invalid Test Type' }, { status: 404 });
        
        const expectedQuestions = testData.total_questions;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using Pro for structural accuracy reading OMRs, as Flash might hallucinate density. 
        // Real-world, you might scale down to Flash once prompt is perfect.
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `
            You are an expert Optical Mark Recognition (OMR) scanner system. 
            A student has uploaded a photograph of their physical NEET OMR bubble sheet.
            
            First, analyze the image quality. Is the text readable? Are the bubbles discernible? 
            If it is completely blurry, too dark, or cut off, mark quality as "poor". Otherwise, mark it "clear".
            
            If it is "clear", extract EVERY SINGLE bubbled answer on the sheet up to question number ${expectedQuestions}.
            Only look for answers A, B, C, or D (sometimes labeled 1, 2, 3, 4 which map to A, B, C, D).
            If a bubble is missing or skipped, mark it as null.
            
            Return YOUR ENTIRE OUTPUT as a pure JSON object mapping strictly to this structure (DO NOT use markdown ticks):
            {
               "quality_check": "clear" | "poor",
               "reason": "If poor, brief reason why like 'Too blurry' or 'Corner cutoff'. If clear, leave empty.",
               "answers": {
                   "1": "A",
                   "2": "C",
                   "3": null,
                   ... up to ${expectedQuestions}
               }
            }
        `;

        const imagePart = { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } };
        
        const result = await model.generateContent([prompt, imagePart]);
        const rawOutput = await result.response.text();
        
        let parsedPayload;
        try {
            const cleanRaw = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            parsedPayload = JSON.parse(cleanRaw);
        } catch (e) {
            console.error("OMR Extraction Parse Error:", rawOutput);
            return NextResponse.json({ error: 'OMR could not be optically parsed. Please flatten the paper and try again.' }, { status: 422 });
        }

        // MD Safeguard 4: Reject garbage in, garbage out
        if (parsedPayload.quality_check !== 'clear') {
            return NextResponse.json({ 
                error: 'Image Quality Rejected', 
                reason: parsedPayload.reason || 'Image is too blurry or dark. Retake.' 
            }, { status: 400 });
        }

        return NextResponse.json({ answers: parsedPayload.answers });
        
    } catch (error) {
        console.error("OMR Core Execution Error:", error);
        return NextResponse.json({ error: 'Internal Vision Server Error' }, { status: 500 });
    }
}
