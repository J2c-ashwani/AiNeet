/**
 * AI Question Generation Prompt System — v2.0
 * 
 * MD Mandate: NEET-standard pedagogy, NCERT grounding, anti-hallucination.
 * Every prompt is versioned. Never modify in-place — create a new version.
 */

const PROMPT_VERSION = 'v2.0';

/**
 * Generate the master question generation prompt.
 * @param {Object} params
 * @param {string} params.subject - Physics / Chemistry / Biology
 * @param {string} params.chapter - Chapter name
 * @param {string} params.topic - Specific topic
 * @param {string} params.difficulty - easy / medium / hard
 * @param {string} params.ncertContext - Injected NCERT source text for grounding
 * @param {string[]} params.existingTexts - Existing question texts in this topic (for dedup)
 */
function buildQuestionPrompt({ subject, chapter, topic, difficulty, ncertContext, existingTexts = [] }) {
    const dedupBlock = existingTexts.length > 0
        ? `\n\nEXISTING QUESTIONS IN THIS TOPIC (DO NOT DUPLICATE):\n${existingTexts.map((t, i) => `${i + 1}. ${t.substring(0, 100)}...`).join('\n')}`
        : '';

    return `You are an expert NEET exam question creator with 20+ years of experience teaching ${subject} for medical entrance exams in India.

SUBJECT: ${subject}
CHAPTER: ${chapter}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}

NCERT SOURCE CONTEXT (use this as your ONLY factual source):
---
${ncertContext || 'No specific context provided. Use standard NCERT Class 11/12 textbook knowledge.'}
---
${dedupBlock}

Generate exactly 1 NEET-standard MCQ following these STRICT rules:

═══ QUESTION RULES ═══
- Must test a specific NCERT concept from the given topic
- Must be solvable in 60-90 seconds (NEET time constraint)
- Must have exactly 4 options labeled A, B, C, D
- ALL 4 options MUST be completely unique — no two options may be identical or near-identical
- Options must be plausible distractors (not obviously wrong)
- Options must be of similar length and grammatical structure
- NEVER use "All of the above", "None of the above", or "Both A and B"
- For numerical questions, ensure units are consistent

═══ EXPLANATION RULES (CRITICAL — THIS IS THE MOST IMPORTANT PART) ═══
- Start with: "Concept: [Name the specific NCERT concept]"
- Provide step-by-step reasoning (minimum 3 logical steps)
- For Physics/Chemistry: show the formula, substitution, and calculation
- For Biology: cite the specific biological process, organism, or classification
- Explain WHY the correct answer is right with scientific reasoning
- Explain WHY at least 2 wrong options are wrong
- Reference the NCERT chapter explicitly: "As stated in NCERT Class [X], Chapter [Y]..."
- Minimum 250 characters for the explanation
- NEVER write generic explanations like "The correct answer is B" or "This is a standard concept"

═══ ANTI-HALLUCINATION RULES ═══
- Do NOT invent scientific facts, species names, or reaction mechanisms
- Do NOT fabricate numerical values or constants
- Do NOT create questions about topics outside the NEET syllabus
- If you are uncertain about any fact, set confidence below 0.7
- Cross-check your answer against the NCERT source context provided above

═══ OUTPUT FORMAT (strict JSON — no markdown, no code blocks) ═══
{
  "text": "The full question text",
  "option_a": "Option A text",
  "option_b": "Option B text",
  "option_c": "Option C text",
  "option_d": "Option D text",
  "correct_option": "A|B|C|D",
  "explanation": "Full NEET-standard explanation following all rules above",
  "difficulty": "${difficulty}",
  "ncert_reference": "Class X, Chapter Y: Topic Name",
  "confidence": 0.0
}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`;
}

/**
 * Build cross-verification prompt (used by Flash for Gate 4).
 */
function buildCrossVerifyPrompt({ questionText, options }) {
    return `You are a NEET exam expert. Read this question carefully and determine the correct answer.

QUESTION: ${questionText}

OPTIONS:
A) ${options.a}
B) ${options.b}
C) ${options.c}
D) ${options.d}

Reply with ONLY a JSON object:
{"correct_option": "A|B|C|D", "reasoning": "brief explanation"}`;
}

/**
 * Build explanation enrichment prompt for existing PYQs.
 */
function buildEnrichmentPrompt({ questionText, options, correctOption, subject }) {
    return `You are an expert ${subject} teacher preparing NEET students.

A student needs a detailed explanation for this Previous Year Question (PYQ):

QUESTION: ${questionText}

OPTIONS:
A) ${options.a}
B) ${options.b}
C) ${options.c}
D) ${options.d}

CORRECT ANSWER: ${correctOption}

Provide a NEET-standard explanation that:
1. Names the specific NCERT concept being tested
2. Shows step-by-step reasoning (minimum 3 steps)
3. Explains WHY the correct answer (${correctOption}) is right
4. Explains WHY at least 2 other options are wrong
5. References the NCERT chapter: "As per NCERT Class X, Chapter Y..."
6. Is at least 250 characters long

Reply with ONLY a JSON object:
{"explanation": "...", "ncert_reference": "Class X, Chapter Y: Topic", "confidence": 0.0-1.0}`;
}

module.exports = {
    PROMPT_VERSION,
    buildQuestionPrompt,
    buildCrossVerifyPrompt,
    buildEnrichmentPrompt,
};
