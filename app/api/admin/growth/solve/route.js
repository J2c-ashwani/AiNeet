import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';

const growthSolveSchema = z.object({
    textContent: z.string().max(10_000).optional(),
    imageBase64: z.string().max(2_000_000).optional(),
    mimeType: z.string().trim().max(128).optional().default('image/jpeg'),
}).refine(payload => payload.textContent || payload.imageBase64, {
    message: 'Provide at least text or an image',
});

const responseSchema = z.object({
    topic_detected: z.string(),
    concise: z.string(),
    detailed: z.string(),
    conversational: z.string(),
});

function parseModelJson(rawOutput) {
    const cleanRaw = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanRaw);
    const result = responseSchema.safeParse(parsed);
    if (!result.success) {
        throw new ApiError('AI response did not match the expected contract', 502, 'AI_CONTRACT_MISMATCH');
    }
    return result.data;
}

export const POST = withApiRoute(async (_request, { body }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError('AI provider is not configured', 503, 'AI_PROVIDER_NOT_CONFIGURED');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
        You are the founder of NEET Coach. Your job is to answer a student's Biology, Physics, or Chemistry doubt found on social media.
        The goal is platform-compliant, high-trust, human tone. Do not sound like an AI. Treat the student like a smart peer.

        Based on the image or text provided, identify the student's confusion and write 3 response variants.

        Every response must include:
        1. An engagement hook near the end.
        2. A soft CTA for a free NEET Coach tool or tracker.

        Return only raw JSON with exactly these fields:
        {
          "topic_detected": "e.g., Thermodynamics",
          "concise": "A short 2-3 sentence answer with hook and soft CTA",
          "detailed": "A 5-6 sentence step-by-step breakdown with hook and soft CTA",
          "conversational": "A casual, empathetic response with hook and soft CTA"
        }
    `;

    const result = body.imageBase64
        ? await model.generateContent([
            prompt,
            body.textContent || 'What is the answer to this doubt?',
            { inlineData: { data: body.imageBase64, mimeType: body.mimeType } },
        ])
        : await model.generateContent([prompt, body.textContent]);

    try {
        return parseModelJson(await result.response.text());
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('AI output was malformed', 502, 'AI_OUTPUT_MALFORMED');
    }
}, {
    auth: 'admin',
    bodySchema: growthSolveSchema,
    maxBodySize: 2_100_000,
    rateLimit: { ...RATE_LIMITS.AI_HEAVY, failBehavior: 'closed', key: 'admin:growth-solve' },
});
