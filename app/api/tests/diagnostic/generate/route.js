import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const deviceHash = request.headers.get('x-device-print') || 'unknown';

        // 1. Multi-Layer Cost Protection (Hostel Support vs Bot Block)
        const ipLimit = rateLimit(`diag:ip:${ip}`, 10, 86400000); // 10 per day per IP
        if (!ipLimit.success) return NextResponse.json({ error: 'Daily IP limit reached' }, { status: 429 });

        if (deviceHash !== 'unknown') {
            const deviceLimit = rateLimit(`diag:device:${deviceHash}`, 2, 86400000); // 2 per day per exact device
            if (!deviceLimit.success) return NextResponse.json({ error: 'Daily device limit reached' }, { status: 429 });
        }

        const supabase = await getDb();

        // 2. The 70/30 Hybrid Execution Model (Defaulting entirely to Bio for minimal friction)
        console.log('[ACQUISITION FUNNEL] Fetching 7 Biology PYQs...');
        
        // Grab biology subjects (Botany / Zoology - assuming generic subject_ids 3 & 4 or string matching)
        // Hardcoding standard NEET Biology fallback
        const { data: fetchPyq, error: dbErr } = await supabase.from('questions')
            .select('*')
            .eq('is_pyq', 1)
            .limit(200);

        if (dbErr) throw dbErr;

        // Filter for Bio roughly and shuffle
        const bioQuestions = (fetchPyq || [])
            .filter(q => q.subject_id === 3 || q.subject_id === 4 || q.text?.toLowerCase().includes('cell') || q.text?.toLowerCase().includes('plant'))
            .sort(() => Math.random() - 0.5);

        const databaseFallbackMode = bioQuestions.length < 7;
        let questions = databaseFallbackMode ? (fetchPyq || []).sort(() => Math.random() - 0.5).slice(0, 7) : bioQuestions.slice(0, 7);

        // 3. Dynamic RAG Call (3 Questions) to maintain "AI Magic" premium feel
        console.log('[ACQUISITION FUNNEL] Generating 3 Dynamic Biology AI Questions...');
        try {
            const { generateInstantQuestions } = await import('@/lib/rag_engine');
            const { verifyQuestion } = await import('@/lib/ai_verifier');
            
            // Generate exact 3, verify rapidly
            const aiQuestions = await generateInstantQuestions('NEET High Yield Biology', 3);
            for (let q of aiQuestions) {
                const verification = await verifyQuestion(q, q.source_context || '');
                if (verification.verification_status !== 'rejected') {
                    q.correct_option = verification.verified_answer || q.correct_option;
                    
                    // Fire-and-forget async insert into DB to build our global cache
                    supabase.from('questions').insert({
                        id: q.id, text: q.text, option_a: q.option_a, option_b: q.option_b, 
                        option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option, 
                        difficulty: 'medium', subject_id: 3, is_ai_generated: 1
                    }).then(() => {}).catch(() => {});

                    questions.push(q);
                }
            }
        } catch (llmErr) {
            console.error('[ACQUISITION FUNNEL] LLM failed, substituting purely from DB pool');
            // If LLM dies, grab 3 more from DB to ensure they don't bounce
            const safetyNets = (fetchPyq || []).sort(() => Math.random() - 0.5).slice(0, 15).filter(sq => !questions.some(q => q.id === sq.id)).slice(0, 3);
            questions.push(...safetyNets);
        }

        // 4. Secure Payload stripping (Crucial for Silent Backend Grading security in Phase 2)
        // We MUST NOT send `correct_option` down to the client so they cannot forge scores
        const clientQuestions = questions.map((q, idx) => ({
            id: q.id, 
            index: idx + 1, 
            text: q.text,
            option_a: q.option_a, 
            option_b: q.option_b, 
            option_c: q.option_c, 
            option_d: q.option_d,
            is_ai_generated: q.is_ai_generated ? 1 : 0
            // Notice: correct_option and explanation are stripped entirely!
        }));

        console.log(`[ACQUISITION FUNNEL] Successfully handed off stateless test bundle to frontend.`);

        return NextResponse.json({
            success: true,
            questions: clientQuestions,
            totalQuestions: clientQuestions.length,
            timeLimit: clientQuestions.length * 90 // 90 seconds per question pacing
        });

    } catch (error) {
        console.error('Diagnostic Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate diagnostic context' }, { status: 500 });
    }
}
