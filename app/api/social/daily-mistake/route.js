import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { callAIWithFallback } from '@/lib/ai-engine';

// This route feeds your external n8n automation pipeline
export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
        return new NextResponse('Unauthorized: Invalid N8N API Key', { status: 401 });
    }

    try {
        const supabase = await createSupabaseServerClient();
        
        // 1. Fetch Yesterday's Worst Performing Question
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const { data: worstQuestion } = await supabase
            .from('mistake_log')
            .select('question_id, mistake_count')
            .gte('last_mistake_at', yesterday)
            .order('mistake_count', { ascending: false })
            .limit(1)
            .single();

        if (!worstQuestion) {
            return NextResponse.json({ message: 'No significant mistakes yesterday. Skipping social post.' }, { status: 200 });
        }

        const { data: qData } = await supabase
            .from('questions')
            .select('text, topics(name), subject')
            .eq('id', worstQuestion.question_id)
            .single();

        if (!qData) {
            return NextResponse.json({ error: 'Question data not found' }, { status: 404 });
        }

        const topicName = qData.topics?.name || 'Science';
        const subject = qData.subject?.toUpperCase() || 'NEET';

        // 2. Generate the Social Media Video Script (MD Context Engine)
        const systemPrompt = `You are an aggressive, high-energy educational content creator specializing in Instagram Reels and YouTube Shorts for premed students (NEET exam).
        Generate a 60-second video script. 
        Focus heavily on the "mistake" angle. 
        Use short, punchy sentences. Include visual cues in brackets [like this].
        
        Output Raw JSON exactly like this:
        {
          "hook": "string (0-5 seconds)",
          "body": "string (the explanation)",
          "call_to_action": "string (tell them to check their mistake heatmap on aineetcoach.com)",
          "caption": "string (the instagram text caption with hashtags)",
          "suggested_background_visual": "string"
        }`;

        const promptText = `
        Topic: ${topicName}
        Question: ${qData.text}
        Context Idea: ${worstQuestion.mistake_count} students taking our Mock Exam yesterday fell for this exact trap. Explain why they failed and give them the memory trick.
        `;

        const { text: resultText } = await callAIWithFallback(systemPrompt, promptText, 'gemini');
        
        // Extract JSON
        const jsonStr = resultText.replace(/^```json/g, '').replace(/```$/g, '').trim();
        const scriptData = JSON.parse(jsonStr);

        // 3. Return structured payload to N8N for Video Generation
        return NextResponse.json({
            success: true,
            metadata: {
                topic: topicName,
                subject: subject,
                failure_count: worstQuestion.mistake_count,
            },
            n8n_payload: scriptData,
            raw_question: qData.text
        });

    } catch (error) {
        console.error('N8N Social Hook Failed:', error);
        return NextResponse.json({ error: 'Failed to generate social script' }, { status: 500 });
    }
}
