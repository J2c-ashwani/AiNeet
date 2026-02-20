
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UsageTracker } from './usage';
import { getPlan } from './plans';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

export async function analyzeImageDoubt(userId, userTier, imageBuffer, mimeType) {
    try {
        // 1. Check Plan Permissions
        const plan = getPlan(userTier);
        if (!plan.limits.vision_enabled) {
            throw new Error("Upgrade to Premium to use Snap & Solve.");
        }

        // 2. Check Usage Limits (Vision counts as 5 doubts due to cost)
        const canProceed = await UsageTracker.checkLimit(userId, userTier, 'ai_doubts_per_day');
        if (!canProceed) throw new Error("Daily doubt limit reached.");

        console.log(`👁️ Processing Vision Request for User ${userId}...`);

        // 3. Call Gemini Pro Vision
        // Note: 'gemini-1.5-flash' is multimodal and good for this.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert NEET Physics/Chemistry/Biology tutor.
        Analyze this image. It contains a question or problem.
        1. Transcribe the question text if visible.
        2. Solve the problem step-by-step.
        3. Explain the concept clearly using standard NEET terminology.
        4. If it's a diagram, explain what is shown.
        
        Format the response in Markdown.
        `;

        // Convert buffer to base64 for the API
        const imageBase64 = imageBuffer.toString('base64');

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            }
        ]);

        const response = result.response;
        const text = response.text();

        // 4. Track Usage (Increment heavier for vision)
        // We'll increment doubt count by 1 for simplicity in user view, 
        // but token usage will naturally be higher and tracked by usage tracker if we hook it up.
        // For now, just ensuring they have quota is enough.
        await UsageTracker.increment(userId, 'ai_doubt_count');
        // Ideally we track tokens too, but simplified here.

        return text;

    } catch (error) {
        console.error("Vision Engine Error:", error);
        throw error; // Re-throw for API to handle
    }
}
