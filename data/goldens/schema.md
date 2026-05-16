# Elite Tutor Golden Dataset

This directory contains manually verified, canonically perfect explanations for NEET Coach RAG benchmarking.
These "Goldens" serve as the absolute ground truth.

## Purpose
- **Regression Testing:** Before upgrading embeddings, prompts, or LLM models, test the new output against the Golden Dataset.
- **Hallucination Baseline:** Ensures that the model is not suffering from generation drift over time.
- **Prompt Tuning Reference:** Few-shot examples can be drawn from here if necessary.

## Schema
Each subject file (e.g. `biology_goldens.json`) contains an array of objects matching this schema:

```json
{
  "question_id": "uuid-or-int",
  "text": "What are the characteristic features of a prokaryotic cell?",
  "correct_option": "A",
  "golden_explanation": {
    "concept_tested": "Prokaryotic Cell Structure",
    "correct_answer_reasoning": "According to NCERT, prokaryotic cells are characterized by the absence of a well-defined nucleus, as their genetic material is 'naked' and not enveloped by a nuclear membrane. The text further specifies that no organelles like the ones found in eukaryotes are present...",
    "why_other_options_wrong": "Option B is incorrect because prokaryotes have 70S ribosomes, not 80S. Option C is incorrect because they lack a nuclear membrane. Option D is incorrect because their DNA is circular and not wrapped around histones.",
    "neet_exam_insight": "Examiners frequently trap students by mixing up 70S (prokaryotic/organelle) and 80S (eukaryotic cytosolic) ribosomes.",
    "ncert_reference": "The prokaryotic cells lack such membrane bound organelles."
  },
  "required_chunk_ids": [
    "uuid-chunk-1",
    "uuid-chunk-2"
  ]
}
```

## Maintenance
- Elite educators/MDs should add 10-20 highly complex PYQs (assertion/reason, multi-statement) per subject.
- These should represent the hardest validation cases for the AI.
