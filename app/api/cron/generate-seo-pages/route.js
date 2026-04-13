import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { callAIWithFallback } from '@/lib/ai-engine';

export async function GET(request) {
    // Basic Cron Auth
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await getDb();
        
        // 1. Fetch High-Mistake Candidates (MD Guardrail: Only fetch quality failures)
        let { data: candidates, error } = await supabase.rpc('get_top_mistakes_for_seo', { limit_num: 5 });
        
        if (error || !candidates) {
            // Fallback to manual query if RPC doesn't exist
            const { data: fallbackCandidates } = await supabase
                .from('mistake_log')
                .select('question_id, mistake_count')
                .order('mistake_count', { ascending: false })
                .limit(10);
                
            if (!fallbackCandidates || fallbackCandidates.length === 0) {
                return NextResponse.json({ message: 'No candidates found.' });
            }
            
            // Just picking the top one for demonstration of the script
            candidates = [fallbackCandidates[0]];
        }

        let generatedCount = 0;

        for (const candidate of candidates) {
            // Check if we already generated a page for this question
            const { data: existing } = await supabase.from('seo_pages').select('id').eq('source_question_id', String(candidate.question_id)).single();
            if (existing) continue;

            const { data: qData } = await supabase.from('questions').select('text, topics(name), chapters(name), subject').eq('id', candidate.question_id).single();
            if (!qData) continue;

            // 2. Generate Unique SEO Content with Mistake Insights (MD Mandate)
            const topicName = qData.topics?.name || 'NEET Concept';
            const subject = qData.subject?.toUpperCase() || 'SCIENCE';
            
            // Clean question for SLUG
            const cleanSlug = qData.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 80);
            const finalSlug = `how-to-solve-${cleanSlug}-${Math.floor(Math.random()*1000)}`;

            const systemPrompt = `You are a world-class NEET SEO content writer. 
            Generate a detailed, comprehensive tutorial answering the student's question.
            Output ONLY raw JSON format with the following keys:
            "title": (Catchy, SEO friendly H1, max 60 chars)
            "meta_description": (Punchy summary, max 150 chars)
            "content_markdown": (The actual HTML/Markdown body. Include an 'Explanation Angle' using real-world analogies. Must be deeply educational. NEVER use generic AI intro/outros.)`;

            const promptText = `
            Question: ${qData.text}
            Topic: ${topicName} (${subject})
            Insight: Over ${candidate.mistake_count} local NEET Coach students failed this exact question in their mock tests recently.
            
            Write the content highlighting why so many students fall for this trap, and how to conquer it conceptually.
            `;

            const { text: resultText } = await callAIWithFallback(systemPrompt, promptText, 'gemini');
            
            try {
                // Remove potential markdown code blockers if AI wraps in ```json
                const jsonStr = resultText.replace(/^```json/g, '').replace(/```$/g, '').trim();
                const seoData = JSON.parse(jsonStr);

                // 3. Build JSON-LD (QAPage Schema)
                const jsonLd = {
                    "@context": "https://schema.org",
                    "@type": "QAPage",
                    "mainEntity": {
                        "@type": "Question",
                        "name": seoData.title,
                        "text": qData.text,
                        "answerCount": 1,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": seoData.meta_description,
                            "url": `https://aineetcoach.com/doubts/${finalSlug}`
                        }
                    }
                };

                // 4. Insert into `seo_pages`
                await supabase.from('seo_pages').insert({
                    slug: finalSlug,
                    title: seoData.title,
                    meta_description: seoData.meta_description,
                    content_markdown: seoData.content_markdown,
                    json_ld: JSON.stringify(jsonLd),
                    source_question_id: String(candidate.question_id)
                });
                
                generatedCount++;
            } catch(e) {
                console.error(`Failed to parse AI structure for question ${candidate.question_id}`, e);
            }
        }

        return NextResponse.json({ success: true, generated: generatedCount });
    } catch (error) {
        console.error('SEO Cron error:', error);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
