
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRequiredServerSecret } from './server-secrets';

const GEMINI_API_KEY = getRequiredServerSecret('GEMINI_API_KEY');
const genAI = GEMINI_API_KEY
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;

export async function verifyQuestion(question, sourceContext) {
    if (!genAI) {
        return verifierUnavailable('GEMINI_NOT_CONFIGURED');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
        You are a Quality Control Expert for NEET Exams.
        
        Review this question:
        Q: ${question.text}
        A: ${question.option_a}
        B: ${question.option_b}
        C: ${question.option_c}
        D: ${question.option_d}
        Correct: ${question.correct_option}
        
        Source Material: "${sourceContext}"

        Evaluate for:
        1. Correctness (Is the answer mostly right?)
        2. Relevance (Is it related to the source?)
        3. Quality (Is it readable?)

        Return JSON:
        {
            "isValid": boolean,
            "confidence_score": number (0-100),
            "issues": string[],
            "verified_answer": "A"|"B"|"C"|"D"
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonText);

        return {
            isValid: analysis.isValid,
            confidence_score: analysis.confidence_score,
            verification_status: analysis.confidence_score > 80 ? 'verified' : (analysis.confidence_score < 40 ? 'rejected' : 'flagged'),
            verified_answer: analysis.verified_answer,
            issues: analysis.issues
        };

    } catch (error) {
        console.error('Verifier Error:', error);
        return verifierUnavailable('VERIFIER_FAILED');
    }
}

function verifierUnavailable(reason) {
    return {
        isValid: false,
        confidence_score: 0,
        verification_status: 'flagged',
        verified_answer: null,
        issues: [reason]
    };
}
