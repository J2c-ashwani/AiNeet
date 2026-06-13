#!/usr/bin/env node

import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

function arg(name, fallback = '') {
    const idx = process.argv.indexOf(`--${name}`);
    return idx >= 0 ? process.argv[idx + 1] : fallback;
}

function intArg(name, fallback = 0) {
    const value = Number(arg(name, String(fallback)));
    return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

const auditType = arg('type', 'rag_retrieval');
const subject = arg('subject', null);
const sampleSize = intArg('sample-size');
const passCount = intArg('pass');
const warnCount = intArg('warn');
const failCount = intArg('fail');
const hallucinationCount = intArg('hallucination');
const syllabusLeakageCount = intArg('syllabus-leakage');
const wrongAnswerCount = intArg('wrong-answer');

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
}

const allowedAuditTypes = [
    'rag_retrieval',
    'teacher_review',
    'model_benchmark',
    'question_bank',
    'syllabus_compliance',
    'question_quality',
    'answer_quality',
    'doubt_solver',
    'mock_test',
    'rag_certification',
    'faculty_review',
    'student_outcome',
    'academic_governance',
    'neet_benchmark',
    'external_board',
    'gold_standard_bank',
    'adversarial_academic',
    'public_certification_report',
];

if (!allowedAuditTypes.includes(auditType)) {
    console.error(`--type must be one of: ${allowedAuditTypes.join(', ')}.`);
    process.exit(1);
}

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4,
});

try {
    await db.query(`
        INSERT INTO educational_quality_audits (
            audit_type,
            subject,
            sample_size,
            pass_count,
            warn_count,
            fail_count,
            hallucination_count,
            syllabus_leakage_count,
            wrong_answer_count,
            evidence
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
    `, [
        auditType,
        subject,
        sampleSize,
        passCount,
        warnCount,
        failCount,
        hallucinationCount,
        syllabusLeakageCount,
        wrongAnswerCount,
        JSON.stringify({ source: 'manual-certification-entry' }),
    ]);

    console.log(`Recorded ${auditType} educational quality audit for ${subject || 'all subjects'}.`);
} finally {
    await db.end();
}
