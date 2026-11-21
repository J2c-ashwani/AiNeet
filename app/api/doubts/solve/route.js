import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { generateDoubtResponse } from '@/lib/ai-engine';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const questionText = body.questionText || body.message || body.question;
    const imageBase64 = body.imageBase64;
    const mimeType = body.mimeType || 'image/jpeg';

    if (!questionText && !imageBase64) {
      return NextResponse.json({ error: 'Question text or image is required' }, { status: 400 });
    }

    const prompt = questionText || 'Please analyze this NEET image doubt and provide step-by-step guidance.';

    const answer = await generateDoubtResponse(prompt, '', user, imageBase64, mimeType);

    return NextResponse.json({
      answer,
      text: answer,
      solution: answer,
      provider: 'ai-engine',
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: 'AI service is temporarily unavailable. Please try again in a moment.',
    }, { status: 500 });
  }
}
