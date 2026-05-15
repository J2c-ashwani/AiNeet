/**
 * AI Question Fact Consistency Engine
 * 
 * MD Mandate: Validator checks structure. Fact-checker checks scientific truth.
 * Priority: P0 (Biology taxonomy, Chemistry reactions, Physics dimensions)
 */

/**
 * Validates the scientific truth of an AI-generated question and explanation.
 * This is meant to be called alongside the Validator Layer.
 * 
 * @param {Object} question - The generated question object
 * @param {string} subject - physics | chemistry | biology
 * @param {Function} aiCheckFn - async (prompt) => { isFactuallyCorrect: boolean, errorDetails?: string }
 */
async function checkFactConsistency(question, subject, aiCheckFn) {
    if (!aiCheckFn) {
        console.warn('Fact checking requires an aiCheckFn (typically Gemini 2.5 Flash). Skipping fact check.');
        return { isFactuallyCorrect: true };
    }

    let domainSpecificRules = '';

    if (subject.toLowerCase() === 'biology') {
        domainSpecificRules = `
CRITICAL BIOLOGY CHECKS:
1. Taxonomy correctness (e.g., correct genus/species capitalization, correct phylum).
2. Terminology correctness (no made-up biological terms).
3. NCERT Class 11/12 Biology consistency (must align perfectly with the NCERT textbook facts).
        `;
    } else if (subject.toLowerCase() === 'chemistry') {
        domainSpecificRules = `
CRITICAL CHEMISTRY CHECKS:
1. Reaction correctness (reactants, products, catalysts, conditions).
2. Valency and stoichiometry balancing logic.
3. Unit correctness (e.g., kJ/mol, molarity vs molality).
        `;
    } else if (subject.toLowerCase() === 'physics') {
        domainSpecificRules = `
CRITICAL PHYSICS CHECKS:
1. Dimensional consistency (LHS dimensions must equal RHS dimensions).
2. Formula correctness (e.g., 1/2 mv^2 vs mv^2).
3. Unit correctness (e.g., Newtons, Joules, Watts) and vector vs scalar logic.
        `;
    }

    const prompt = `You are an elite scientific fact-checker for the NEET medical entrance exam.
Your ONLY job is to identify scientific errors, hallucinations, or contradictions in the following question and explanation.

${domainSpecificRules}

QUESTION: ${question.text}
A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

CORRECT ANSWER CLAIMED: ${question.correct_option}
EXPLANATION GIVEN: ${question.explanation}

Is the correct answer objectively true, AND is the scientific reasoning in the explanation 100% accurate without any hallucinations?

Respond with ONLY JSON:
{
  "isFactuallyCorrect": true|false,
  "errorDetails": "If false, briefly explain the scientific error. If true, leave empty."
}`;

    try {
        const result = await aiCheckFn(prompt);
        return result; // Expected shape: { isFactuallyCorrect: boolean, errorDetails?: string }
    } catch (e) {
        return { isFactuallyCorrect: false, errorDetails: 'Fact-checker AI call failed: ' + e.message };
    }
}

module.exports = {
    checkFactConsistency
};
