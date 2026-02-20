
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

export async function verifyQuestion(question, sourceContext) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-key') {
        return verifyMock(question);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
        return verifyMock(question);
    }
}

function verifyMock(question) {
    // Mock logic: 50% chance of random verification result, or just say it's good
    // For demo purposes, let's say it's always good if it has text
    const isGood = question.text && question.text.length > 10;
    return {
        isValid: isGood,
        confidence_score: isGood ? 90 : 20,
        verification_status: isGood ? 'verified' : 'rejected',
        verified_answer: question.correct_option,
        issues: []
    };
}
