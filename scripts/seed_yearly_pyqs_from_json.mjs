import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Setup .env.local keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SUBJECT_ALIAS = {
    'Physics': 'Physics',
    'Chemistry': 'Chemistry',
    'Botany': 'Biology',
    'Zoology': 'Biology'
};

async function getIds() {
    const { data: subjects } = await supabase.from('subjects').select('id, name');
    const subjectMap = {};
    if (subjects) subjects.forEach(s => subjectMap[s.name] = s.id);

    const chapterMap = {};
    const topicMap = {};

    for (const sub of subjects || []) {
        const { data: chapter } = await supabase.from('chapters').select('id').eq('subject_id', sub.id).limit(1).single();
        if (chapter) {
            chapterMap[sub.id] = chapter.id;
            const { data: topic } = await supabase.from('topics').select('id').eq('chapter_id', chapter.id).limit(1).single();
            if (topic) topicMap[chapter.id] = topic.id;
        }
    }

    return { subjectMap, chapterMap, topicMap };
}

async function seed() {
    const { subjectMap, chapterMap, topicMap } = await getIds();
    const pyqFile = 'yearly_pyqs_2013_2019_ocr.json';

    if (!fs.existsSync(pyqFile)) {
        console.error(`File not found: ${pyqFile}`);
        return;
    }

    let questions = JSON.parse(fs.readFileSync(pyqFile, 'utf8'));
    console.log(`Found ${questions.length} total questions.`);

    let dbQuestionsBatch = [];
    let skipCount = 0;

    for (const q of questions) {
        const dbSubjectName = SUBJECT_ALIAS[q.subject];
        if (!dbSubjectName) {
            skipCount++;
            continue;
        }

        const subId = subjectMap[dbSubjectName];
        if (!subId) {
            skipCount++;
            continue;
        }

        const chapId = chapterMap[subId] || 1;
        const topId = topicMap[chapId] || 1;

        const oA = q.options['Option 1'] || 'A';
        const oB = q.options['Option 2'] || 'B';
        const oC = q.options['Option 3'] || 'C';
        const oD = q.options['Option 4'] || 'D';

        dbQuestionsBatch.push({
            subject_id: subId,
            chapter_id: chapId,
            topic_id: topId,
            text: q.text,
            option_a: oA,
            option_b: oB,
            option_c: oC,
            option_d: oD,
            correct_option: 'A',
            difficulty: 'neet',
            year_asked: String(q.year),
            is_pyq: 1,
            source_context: 'PDF OCR'
        });
    }

    // Bulk insert in batches of 500
    const BATCH_SIZE = 500;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < dbQuestionsBatch.length; i += BATCH_SIZE) {
        const batch = dbQuestionsBatch.slice(i, i + BATCH_SIZE);
        print(`Inserting batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`);

        const { error } = await supabase.from('questions').insert(batch);
        if (error) {
            console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, error.message);
            errorCount += batch.length;
        } else {
            successCount += batch.length;
        }
    }

    console.log(`Done! Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skipCount}`);
}

function print(msg) {
    process.stdout.write(msg + '\n');
}

seed().catch(console.error);
