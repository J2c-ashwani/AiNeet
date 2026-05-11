import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDb } from '@/lib/core/db';

/**
 * OMR Scan API — v2
 * 
 * Uses Gemini Vision to extract bubble answers from a photographed OMR sheet.
 * Supports both dynamic PYQ tests (pyq_YEAR) and manual offline_tests.
 */
export async function POST(request) {
    try {
        const supabase = await getDb();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Please sign in to use OMR Scanner.' }, { status: 401 });
        }

        let _body;
        try { _body = await request.json(); } catch {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const { imageBase64, mimeType, testId } = _body;

        if (!imageBase64 || !testId) {
            return NextResponse.json({ error: 'Missing image or test selection' }, { status: 400 });
        }

        // Determine expected question count
        let expectedQuestions = 180; // NEET default

        if (testId.startsWith('pyq_')) {
            // Dynamic PYQ — get count from questions table
            const year = testId.replace('pyq_', '').replace(/_/g, ' ');
            const { count } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('is_pyq', 1)
                .eq('year_asked', year);
            
            expectedQuestions = count || 180;
        } else {
            // Manual offline test
            const { data: testData } = await supabase
                .from('offline_tests')
                .select('total_questions')
                .eq('id', testId)
                .single();
            
            if (!testData) {
                return NextResponse.json({ error: 'Test not found' }, { status: 404 });
            }
            expectedQuestions = testData.total_questions;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
            return NextResponse.json({ 
                error: 'Couldn\'t read the answer sheet clearly. Please flatten the paper, improve lighting, and try again.' 
            }, { status: 422 });
        }

        if (parsedPayload.quality_check !== 'clear') {
            return NextResponse.json({ 
                error: 'Image quality too low', 
                reason: parsedPayload.reason || 'Image is too blurry or dark. Please retake with better lighting.' 
            }, { status: 400 });
        }

        return NextResponse.json({ answers: parsedPayload.answers });
        
    } catch (error) {
        console.error("OMR Scan Error:", error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
