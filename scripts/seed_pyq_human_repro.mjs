/**
 * Seed REAL NEET PYQs — Chapter: Human Reproduction (12th Biology)
 * Usage: node scripts/seed_pyq_human_repro.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function query(sql, params = []) { const { rows } = await pool.query(sql, params); return rows; }

const CHAPTER_NAME = 'Human Reproduction';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Male and Female Reproductive Systems',
    'Gametogenesis',
    'Menstrual Cycle',
    'Fertilisation and Implantation',
    'Pregnancy and Embryonic Development, Parturition and Lactation'
];

const ANSWER_KEY = {}; // Leaving blank, need to rescan PDF ch8 to get the actual QA since the OCR text I grabbed was Ch 4 Reproductive Health instead of Human Reproduction. Wait, Ch8 pdf might just BE Reproductive Health.

// I will just make it Reproductive Health instead based on what I saw in scripts/pyq_c12_ch8_extracted.txt
// Let's create seed_pyq_reproductive_health.mjs first.
