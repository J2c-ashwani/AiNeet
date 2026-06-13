# NEET Coach Academic Quality Assurance and Certification Program

Status: Active framework  
Owner: Chief Academic Office  
Applies to: questions, explanations, doubt solving, mock tests, RAG retrieval, study plans, analytics, and academic governance  
Certification runner: `scripts/academic-certification.mjs`  
Evidence migration: `scripts/migrations/006_academic_certification_program.sql`

## 1. Purpose

This program exists to prove academic quality through reproducible evidence. It must never rely on a generic claim that AI is accurate. Every certification cycle must produce stored evidence, measurable metrics, timestamps, corpus/version identifiers, pass/fail findings, and a final scorecard.

The certification evidence must be suitable for:

- NGOs
- Schools
- Coaching institutes
- Parents
- Students
- Institutional partners
- Investors
- Internal compliance reviews

## 2. Non-Negotiable Principle

The platform may only claim academic certification when the evidence proves it.

Do not say:

```text
AI is accurate.
```

Say only:

```text
In certification cycle <cycle_id>, the platform achieved <score>/100 based on stored evidence across syllabus validation, NEET benchmark comparison, question review, answer verification, RAG retrieval validation, independent faculty review, adversarial tutor testing, student outcome analysis, and governance checks.
```

## 3. Certification Cycle

Every cycle must have:

- Stable cycle ID
- Certification version
- Academic corpus version
- Official syllabus version
- Official syllabus source URL
- Official syllabus source checksum
- Evidence JSON hash
- Generated Markdown report
- Generated JSON summary
- Public Markdown/HTML/PDF report when approved for sharing
- Database evidence rows when running live certification

Recommended cycle triggers:

- New official NEET syllabus or NCERT rationalization update
- New NCERT embedding ingestion
- New question-generation prompt
- New explanation/tutor prompt
- Major RAG engine change
- Mock test generator change
- Before institutional demo
- Before school/coaching partnership pilot
- Before investor diligence
- Monthly during active production

## 4. Evidence Storage

Apply the migration before live certification:

```bash
psql "$DATABASE_URL" -f scripts/migrations/006_academic_certification_program.sql
```

Evidence tables:

- `academic_certification_cycles`
- `academic_certification_level_results`
- `academic_certification_evidence_items`
- `academic_faculty_review_items`
- `academic_student_outcome_snapshots`
- `academic_external_review_board_members`
- `academic_external_review_signoffs`
- `certified_question_repository`
- `neet_benchmark_papers`
- `neet_benchmark_questions`
- `neet_benchmark_certification_runs`
- `academic_adversarial_evaluation_items`
- `academic_public_certification_reports`

RLS is enabled on every table. No public policies are created. These records are internal academic compliance evidence and should be accessed through service-role/admin paths only.

## 5. Running Certification

Generate an evidence template:

```bash
npm run certify:academics:template
```

Run offline/local certification from an evidence file:

```bash
npm run certify:academics -- --evidence docs/evidence/academic-cycle-YYYY-MM-DD.json
```

Run live certification with DB snapshot and evidence storage:

```bash
npm run certify:academics:live -- --evidence docs/evidence/academic-cycle-YYYY-MM-DD.json --store
```

The runner intentionally fails if evidence is missing, metrics are incomplete, or sample sizes are below the required minimum. This is a feature, not a bug.

Import externally verified academic evidence:

```bash
npm run import:academic-evidence -- --file docs/evidence/verified-academic-bundle-YYYY-MM-DD.json --cycle-id academic-YYYYMMDD
```

Use this template to prepare the import file:

```text
docs/evidence/verified-academic-bundle.template.json
```

Patch a collected evidence file only with a signed/hashed audit bundle:

```bash
npm run patch:academic-evidence -- --audit-bundle docs/evidence/verified-audit-bundle-YYYY-MM-DD.json --evidence reports/academic-certification/evidence-YYYYMMDDHHMMSS.json
```

Use this template to prepare the audit patch file:

```text
docs/evidence/verified-audit-bundle.template.json
```

The importer and patcher reject placeholder, fake, seeded, or un-hashed evidence. They are designed for real faculty-reviewed, benchmarked, or evaluator-backed academic evidence only.

Generate a public shareable report after a certification run:

```bash
npm run certify:academics:public -- --summary reports/academic-certification/<cycle-id>.json --pdf
```

The public report is a summarized credibility asset for NGOs, schools, coaching institutes, CSR programs, parents, students, investors, and institutional partners. It must not expose private student data, raw prompts, secret evidence, or internal reviewer notes.

## 6. Certification Levels

### Level 1: Syllabus Compliance Certification

Purpose: verify all active content aligns with the current official NEET syllabus.

Required checks:

- Current NCERT alignment
- Deleted chapter exclusion
- Rationalized syllabus compliance
- Subject classification accuracy
- Chapter classification accuracy
- Topic classification accuracy

Required metrics:

- `ncertAlignmentPct`
- `deletedChapterLeakagePct`
- `crossSubjectLeakagePct`
- `subjectClassificationAccuracyPct`
- `chapterClassificationAccuracyPct`
- `topicClassificationAccuracyPct`

Pass criteria:

- NCERT Alignment >= 98%
- Deleted Syllabus Leakage = 0%
- Cross Subject Leakage < 1%
- Subject/chapter/topic classification >= 98%

### Level 2: Question Quality Certification

Purpose: verify generated questions meet NEET academic and assessment standards.

Minimum sample size: 5,000 generated questions per cycle.

Required metrics:

- `accuracyPct`
- `ambiguityPct`
- `duplicateQuestionPct`
- `hallucinationPct`
- `invalidOptionPct`
- `difficultyCalibrationPct`
- `ncertGroundingPct`

Pass criteria:

- Accuracy >= 97%
- Hallucination <= 1%
- Invalid Options <= 1%
- Duplicate Questions <= 2%

Each evidence item should preserve the generated question, source prompt version, model version, subject/chapter/topic metadata, correct option, explanation, automated validator result, duplicate-check result, and reviewer decision where applicable.

### Level 3: Answer Quality Certification

Purpose: verify correctness of explanations and solutions.

Minimum sample size: 2,000 AI-generated answers.

Required metrics:

- `answerAccuracyPct`
- `explanationAccuracyPct`
- `hallucinationPct`
- `referenceConsistencyPct`
- `scientificCorrectnessPct`
- `terminologyCorrectnessPct`

Pass criteria:

- Answer Accuracy >= 98%
- Hallucination <= 1%

### Level 4: AI Doubt Solver Certification

Purpose: verify AI tutor responses across Physics, Chemistry, and Biology.

Minimum sample size: 1,000 doubt-solving sessions.

Required metrics:

- `tutorAccuracyPct`
- `groundingPct`
- `hallucinationPct`
- `incompleteResponsePct`
- `conceptDepthPct`
- `simplicityPct`
- `safetyPct`
- `misconceptionDetectionPct`
- `falsePremiseDetectionPct`
- `ambiguityHandlingPct`
- `adversarialSafetyPct`

Pass criteria:

- Tutor Accuracy >= 97%
- Grounding >= 95%
- Adversarial Safety >= 95%

Adversarial academic testing must include:

- Wrong premises
- Mixed concepts
- Misleading wording
- Trick questions
- Ambiguous prompts
- Out-of-syllabus probes
- Unsafe study advice

### Level 5: Mock Test Certification

Purpose: verify generated mocks match NEET preparation needs.

Minimum sample size: 100 generated mock tests per cycle.

Required test types:

- Subject-wise mock
- Chapter-wise mock
- Topic-wise mock
- Weak-area mock
- PYQ-style mock
- Full-syllabus mock

Required metrics:

- `coverageScore`
- `difficultyCalibrationScore`
- `patternSimilarityScore`
- `questionUniquenessPct`
- `timeToCompleteRealismScore`

Pass criteria:

- Similarity to NEET Pattern >= 90%

### Level 6: RAG Certification

Purpose: verify retrieval reliability and source correctness.

Required checks:

- Retrieval relevance
- Source correctness
- Active syllabus filtering
- Deleted syllabus exclusion
- Wrong subject leakage
- Wrong chapter leakage

Required metrics:

- `top1PrecisionPct`
- `top5PrecisionPct`
- `groundingAccuracyPct`
- `corpusIntegrityPct`
- `wrongSubjectRetrievalPct`
- `wrongChapterRetrievalPct`
- `deletedContentRetrievalPct`

Pass criteria:

- Wrong Subject Retrieval < 1%
- Deleted Content Retrieval = 0%
- Corpus Integrity = 100%

### Level 7: Faculty and External Review Certification

Purpose: human NEET faculty validation.

Required reviewers:

- NEET Physics faculty
- NEET Chemistry faculty
- NEET Biology faculty
- Independent external NEET Physics reviewer
- Independent external NEET Chemistry reviewer
- Independent external NEET Biology reviewer

Each reviewer scores:

- Accuracy
- Relevance
- Difficulty
- Exam usefulness

Required metrics:

- `facultyApprovalPct`
- `averageFacultyRating`
- `reviewerSubjectCoverageCount`
- `externalBoardCoverageCount`
- `externalBoardApprovalPct`

Pass criteria:

- Faculty Approval >= 95%
- All three subject reviewers represented
- External review board covers Physics, Chemistry, and Biology
- External board approval >= 95%

External Academic Review Board rules:

- Reviewers must be outside the company.
- Reviewers must provide credential summaries.
- Reviewers must sign independence and conflict-of-interest attestations.
- Annual external review is mandatory for institutional-grade certification.
- Signed reports or signature hashes must be stored as evidence.

### Level 8: Student Outcome Certification

Purpose: measure educational impact on real cohorts.

Required metrics:

- `learningImpactScore`
- `averageImprovementPct`
- `retentionPct`
- `completionRatePct`
- `weakTopicRecoveryPct`
- `timeEfficiencyImprovementPct`

This level proves impact, not only content correctness. Evidence should compare diagnostic score, follow-up score, weak-topic recovery, completion, retention, and time efficiency.

### Level 9: Academic Governance Certification

Purpose: verify academic corpus and audit trail integrity.

Required metrics:

- `governanceCompliancePct`
- `embeddingDimensionsCorrectPct`
- `corpusVersionCoveragePct`
- `checksumCoveragePct`
- `auditTrailCompletenessPct`

Pass criteria:

- Governance Compliance = 100%

Required checks:

- Embedding dimensions correct
- Corpus versions present
- Active syllabus version present
- Source checksums present
- Ingestion batch IDs present
- RAG search filters active/current syllabus
- Audit trail complete

### Level 10: NEET Pattern Benchmarking Certification

Purpose: prove that generated questions and mocks are comparable to real NEET examination standards, not merely internally valid.

Required dataset:

- Last 10 years NEET papers
- NTA sample papers where available
- Official answer keys
- Certified question repository with 10,000-20,000 manually verified questions

Required metrics:

- `officialPaperCoverageCount`
- `ntaSamplePaperCoverageCount`
- `patternSimilarityPct`
- `bloomTaxonomySimilarityPct`
- `topicDistributionSimilarityPct`
- `difficultyDistributionSimilarityPct`
- `questionStyleSimilarityPct`
- `neetPatternAlignmentPct`
- `goldStandardQuestionBankSize`

Pass criteria:

- Last 10 years official NEET papers represented
- At least 1 NTA sample paper represented where available
- Official answer keys represented
- NEET Pattern Alignment >= 95%
- Certified question repository >= 10,000 manually verified questions

This level is the main institutional credibility proof. It supports the stronger claim:

```text
The platform has been independently benchmarked against official NEET patterns, reviewed by subject faculty, validated against NCERT-aligned syllabus standards, and continuously monitored through a documented academic certification program.
```

## 7. Score Weights

| Level | Area | Weight |
|---:|---|---:|
| 1 | Syllabus Compliance | 10 |
| 2 | Question Quality | 14 |
| 3 | Answer Quality | 12 |
| 4 | AI Doubt Solver and Adversarial Testing | 10 |
| 5 | Mock Test | 9 |
| 6 | RAG | 10 |
| 7 | Faculty and External Review Board | 9 |
| 8 | Student Outcome | 8 |
| 9 | Academic Governance | 6 |
| 10 | NEET Benchmark Similarity | 12 |

Total: 100

## 8. Certification Levels

| Score | Level |
|---:|---|
| 90-94 | Bronze |
| 95-97 | Silver |
| 98-98.99 | Gold |
| 99+ | Platinum |

If any required level fails, the platform is not academically certified even if the weighted score is high.

## 9. Final Certification Statement

Use this statement only when every required level passes:

```text
Based on syllabus validation, NEET benchmark comparison, independent faculty review, retrieval validation, question quality evaluation, answer verification, adversarial tutor testing, and student outcome analysis, the platform achieved an Academic Certification Score of XX/100 and is certified at the [Bronze/Silver/Gold/Platinum] level for NEET preparation support.
```

## 10. Evidence File Structure

Every certification run should use a JSON evidence file shaped like:

```json
{
  "certificationVersion": "academic-cert-v1",
  "academicCorpusVersion": "neet-current-YYYY-MM-DD",
  "officialSyllabusVersion": "official-neet-current",
  "officialSyllabusSourceUrl": "https://official-source.example/syllabus.pdf",
  "syllabusSourceChecksum": "sha256:<official-syllabus-file-checksum>",
  "levels": {
    "questionQuality": {
      "sampleSize": 5000,
      "metrics": {
        "accuracyPct": 97.5,
        "ambiguityPct": 0.5,
        "duplicateQuestionPct": 1.2,
        "hallucinationPct": 0.6,
        "invalidOptionPct": 0.4,
        "difficultyCalibrationPct": 96,
        "ncertGroundingPct": 98
      },
      "evidence": [
        {
          "type": "question-quality-batch",
          "source": "teacher-reviewed-batch-2026-06-03",
          "hash": "sha256:<batch-hash>"
        }
      ]
    },
    "neetBenchmark": {
      "sampleSize": 10,
      "metrics": {
        "officialPaperCoverageCount": 10,
        "ntaSamplePaperCoverageCount": 1,
        "patternSimilarityPct": 96,
        "bloomTaxonomySimilarityPct": 95,
        "topicDistributionSimilarityPct": 96,
        "difficultyDistributionSimilarityPct": 95,
        "questionStyleSimilarityPct": 96,
        "neetPatternAlignmentPct": 96,
        "goldStandardQuestionBankSize": 10000
      },
      "evidence": [
        {
          "type": "neet-benchmark-batch",
          "source": "last-10-years-official-neet-papers-plus-nta-sample-paper",
          "hash": "sha256:<benchmark-hash>"
        }
      ]
    }
  }
}
```

Generate a full template with:

```bash
npm run certify:academics:template
```

## 11. Recommended Operating Cadence

| Cadence | Action |
|---|---|
| Daily | RAG retrieval spot checks and active corpus governance checks |
| Weekly | Question quality batch sampling and teacher review queue review |
| Monthly | Full academic certification cycle |
| Every syllabus update | Full Level 1, Level 6, and Level 9 recertification |
| Every AI prompt/model change | Full Level 2, Level 3, Level 4, and Level 6 recertification |
| Every NEET exam cycle | Refresh Level 10 benchmark dataset with latest paper and official answer key |
| Annually | External Academic Review Board sign-off |
| Before school/institution pilot | Full certification report with faculty signatures |

## 12. Evidence That Must Never Be Lost

- Raw generated questions
- Prompt version
- Model version
- Correct answer claim
- Explanation
- NCERT source chunk IDs
- Faculty reviewer score
- External reviewer signature hash
- Rejection reason
- Source checksum
- Corpus version
- Retrieval query and top-k sources
- Official NEET paper source checksum
- NTA sample paper source checksum
- Gold-standard question repository version
- Adversarial prompt and expected behavior
- Student outcome cohort definition
- Final report hash

## 13. Current Integration Points

Existing repo assets that feed this program:

- `scripts/validate-rag-governance.mjs`
- `scripts/validate-retrieval.mjs`
- `scripts/evaluate-rag-quality.js`
- `scripts/record-educational-quality-audit.mjs`
- `scripts/collect-academic-certification-evidence.mjs`
- `scripts/generate-public-academic-certification-report.mjs`
- `scripts/audit-academics.js`
- `lib/ai/validator.js`
- `lib/ai/fact-checker.js`
- `lib/rag_engine.js`
- `rag_explanations`
- `rag_teacher_review_queue`
- `teacher_review_queue`
- `educational_quality_audits`
- `ncert_embeddings`
- `academic_external_review_signoffs`
- `certified_question_repository`
- `neet_benchmark_papers`
- `neet_benchmark_questions`
- `neet_benchmark_certification_runs`
- `academic_adversarial_evaluation_items`
- `academic_public_certification_reports`

## 14. Governance Rule

If the certification runner says `NOT ACADEMICALLY CERTIFIED`, the platform must not use Gold, Platinum, academically certified, faculty certified, or institution-ready language for the failed area.

The stronger phrase `NEET-standard certified` may only be used if Level 10 passes and the external review board has signed the cycle.

Synthetic evidence is prohibited. Do not insert generated names, generated signatures, fake faculty review rows, placeholder benchmark rows, or fabricated 10,000-question repositories to force a certification level. Doing so invalidates the certificate and creates academic/institutional trust risk.
