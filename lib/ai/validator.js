const { z } = require('zod');

/**
 * AI Question Validation Pipeline — 7 Gates
 * MD Mandate: Prevent LLM hallucination and ensure NCERT pedagogy.
 */

// Gate 1: Schema Validation
const questionSchema = z.object({
    text: z.string().min(10, "Question text too short"),
    option_a: z.string().min(1, "Option A missing"),
    option_b: z.string().min(1, "Option B missing"),
    option_c: z.string().min(1, "Option C missing"),
    option_d: z.string().min(1, "Option D missing"),
    correct_option: z.enum(['A', 'B', 'C', 'D']),
    explanation: z.string().min(10, "Explanation missing"),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    ncert_reference: z.string().optional(),
    confidence: z.number().min(0).max(1).optional()
});

/**
 * Validates a generated question against the 7-gate enterprise pipeline.
 * @param {Object} rawQuestion - The parsed JSON from the LLM
 * @param {Object} options - Injection dependencies
 * @param {Function} options.crossVerifyFn - async (text, options) => 'A'|'B'|'C'|'D'
 * @param {Function} options.dedupFn - async (text, topicId) => boolean (true if duplicate)
 * @param {number} options.topicId - The topic ID for deduplication
 * @returns {Promise<{ isValid: boolean, rejectionReason?: string, qualityScore: number, finalQuestion: Object }>}
 */
async function validateQuestion(rawQuestion, { crossVerifyFn, dedupFn, topicId }) {
    try {
        // Gate 1: Schema Validation
        const parsed = questionSchema.parse(rawQuestion);

        // Gate 2: Option Uniqueness
        const opts = [
            parsed.option_a.trim().toLowerCase(),
            parsed.option_b.trim().toLowerCase(),
            parsed.option_c.trim().toLowerCase(),
            parsed.option_d.trim().toLowerCase()
        ];
        const uniqueOpts = new Set(opts);
        if (uniqueOpts.size !== 4) {
            return { isValid: false, rejectionReason: 'Gate 2 Failed: Duplicate options detected.' };
        }

        // Gate 3: Explanation Quality Score
        let qualityScore = 0;
        const expl = parsed.explanation;
        
        // HARD REJECT: Explanations must be meaningful
        if (!expl || expl.length < 30) {
            return { isValid: false, rejectionReason: 'Gate 3 Failed: Explanation too short or missing.' };
        }
        const genericPhrases = ['this is correct because', 'the correct answer is', 'option is correct'];
        if (genericPhrases.some(p => expl.toLowerCase().includes(p)) && expl.length < 80) {
            return { isValid: false, rejectionReason: 'Gate 3 Failed: Explanation is dangerously generic.' };
        }

        if (expl.length >= 200) qualityScore += 20;
        if (expl.length >= 400) qualityScore += 20; // max 40 for length

        const reasoningWords = ['because', 'since', 'therefore', 'due to', 'as a result', 'meaning', 'implies', 'hence'];
        if (reasoningWords.some(w => expl.toLowerCase().includes(w))) qualityScore += 15;
        
        const ncertWords = ['ncert', 'class 11', 'class 12', 'chapter', 'concept'];
        if (ncertWords.some(w => expl.toLowerCase().includes(w)) || parsed.ncert_reference) qualityScore += 15;

        // Base points for structure
        qualityScore += 10; 

        if (qualityScore < 60) {
            return { isValid: false, rejectionReason: 'Gate 3 Failed: Explanation quality score (' + qualityScore + ') below minimum threshold of 60.' };
        }

        // Gate 7: NCERT Concept Tagging Check (Checking it early)
        if (!parsed.ncert_reference || parsed.ncert_reference.trim().length < 5) {
            return { isValid: false, rejectionReason: 'Gate 7 Failed: Missing or invalid NCERT reference.' };
        }

        // Gate 4: Correct Answer Cross-Verify
        if (crossVerifyFn) {
            const verifiedAnswer = await crossVerifyFn(parsed.text, {
                a: parsed.option_a,
                b: parsed.option_b,
                c: parsed.option_c,
                d: parsed.option_d
            });
            if (verifiedAnswer && verifiedAnswer.toUpperCase() !== parsed.correct_option) {
                 return { isValid: false, rejectionReason: 'Gate 4 Failed: Cross-verification model chose ' + verifiedAnswer + ', but generator chose ' + parsed.correct_option + '.' };
            }
        }

        // Gate 5: Text Deduplication
        if (dedupFn && topicId) {
            const isDuplicate = await dedupFn(parsed.text, topicId);
            if (isDuplicate) {
                 return { isValid: false, rejectionReason: 'Gate 5 Failed: Semantic duplicate found in the same topic.' };
            }
        }

        // Gate 6: Difficulty Calibration Bounds (Basic heuristic for now)
        // Hard questions should generally have longer explanations and texts
        if (parsed.difficulty === 'hard') {
             if (parsed.text.length < 30 && expl.length < 250) {
                 // Might not be truly hard
                 parsed.difficulty = 'medium'; // Auto-correct instead of reject
             }
        }

        // MD Rule: Confidence threshold < 0.8 -> hard reject
        const confidence = parsed.confidence || 0.85; // default to pass if not provided by LLM
        if (confidence < 0.80) {
            return { isValid: false, rejectionReason: 'MD Rule Failed: Confidence score (' + confidence + ') below 0.80 threshold.' };
        }

        return {
            isValid: true,
            qualityScore,
            finalQuestion: {
                ...parsed,
                confidence_score: confidence,
                quality_score: qualityScore
            }
        };

    } catch (e) {
        if (e instanceof z.ZodError) {
            return { isValid: false, rejectionReason: 'Gate 1 Failed: Schema violation - ' + e.issues.map(i => i.message).join(', ') };
        }
        return { isValid: false, rejectionReason: 'Validation Error: ' + e.message };
    }
}

module.exports = {
    validateQuestion
};
