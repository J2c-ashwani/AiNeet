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

    if (!questionText && !imageBase64) {
      return NextResponse.json({ error: 'Question text or image is required' }, { status: 400 });
    }

    const prompt = questionText || 'Please analyze this NEET image doubt.';
    const context = imageBase64 ? `[User uploaded image base64, size: ${imageBase64.length} chars]` : '';

    const answer = await generateDoubtResponse(prompt, context, user);

    return NextResponse.json({
      answer,
      text: answer,
      provider: 'ai-engine',
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: 'AI service is temporarily unavailable. Please try again in a moment.',
    }, { status: 500 });
  }
}
