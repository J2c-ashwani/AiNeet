import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import { getDb } from './lib/db.js';
import { NCERT_BOOKS, NEET_BLUEPRINT } from './lib/ncert-data.js';
const db = getDb();

async function audit() {
    const subjects = await db.all('SELECT id, name FROM subjects ORDER BY id');

    for (const subject of subjects) {
        const subjectKey = subject.name.toLowerCase();
        console.log(`\n${'='.repeat(70)}`);
        console.log(`  ${subject.name.toUpperCase()} (subject_id: ${subject.id})`);
        console.log(`${'='.repeat(70)}`);

        // NCERT chapter names
        const ncertChapters = NCERT_BOOKS
            .filter(b => b.subject === subjectKey)
            .flatMap(b => b.chapters.map(ch => ({ name: ch.title, class_level: b.class })));

        // Blueprint topics
        const blueprint = NEET_BLUEPRINT[subjectKey] || {};

        // DB chapters
        const dbChapters = await db.all(
            'SELECT id, name, class_level FROM chapters WHERE subject_id = ? ORDER BY class_level, name',
            [subject.id]
        );

        let totalPYQs = 0;
        let totalMocks = 0;
        let issues = [];

        for (const c of dbChapters) {
            const pyqs = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ? AND is_pyq = 1', [c.id]);
            const mocks = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [c.id]);
            totalPYQs += pyqs.cnt;
            totalMocks += mocks.cnt;

            let flags = [];
            if (pyqs.cnt + mocks.cnt === 0) flags.push('⚠️ EMPTY');
            if (mocks.cnt > 0) flags.push(`⚠️ ${mocks.cnt} MOCKS`);
            const matchesNCERT = ncertChapters.some(nc => nc.name === c.name);
            if (!matchesNCERT) flags.push('❌ NAME NOT IN NCERT_BOOKS');

            console.log(`\n  [Class ${c.class_level}] "${c.name}" — ${pyqs.cnt} PYQs, ${mocks.cnt} mocks ${flags.join(' ')}`);

            // Topic check
            const dbTopics = await db.all('SELECT id, name FROM topics WHERE chapter_id = ?', [c.id]);
            const blueprintTopics = blueprint[c.name] ? Object.keys(blueprint[c.name]) : [];

            if (dbTopics.length > 0 || blueprintTopics.length > 0) {
                // Check how many DB topics match blueprint topics
                const matchedTopics = dbTopics.filter(t => blueprintTopics.includes(t.name));
                const unmatchedDBTopics = dbTopics.filter(t => !blueprintTopics.includes(t.name));
                const missingBlueprintTopics = blueprintTopics.filter(bt => !dbTopics.some(dt => dt.name === bt));

                if (unmatchedDBTopics.length > 0) {
                    console.log(`    ❌ DB topics NOT in blueprint: ${unmatchedDBTopics.map(t => `"${t.name}"`).join(', ')}`);
                    issues.push(`${c.name}: ${unmatchedDBTopics.length} topics not in blueprint`);
                }
                if (missingBlueprintTopics.length > 0 && pyqs.cnt > 0) {
                    console.log(`    ⚠️  Blueprint topics missing from DB: ${missingBlueprintTopics.length} topics`);
                }

                // Check questions with no topic
                const noTopic = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ? AND topic_id IS NULL', [c.id]);
                if (noTopic.cnt > 0) {
                    console.log(`    ⚠️  ${noTopic.cnt} questions have NO topic assigned`);
                    issues.push(`${c.name}: ${noTopic.cnt} questions with no topic`);
                }

                console.log(`    Topics: ${dbTopics.length} in DB, ${blueprintTopics.length} in blueprint, ${matchedTopics.length} matched`);
            }

            if (pyqs.cnt + mocks.cnt === 0) issues.push(`EMPTY: "${c.name}"`);
            if (mocks.cnt > 0) issues.push(`MOCKS: "${c.name}" (${mocks.cnt})`);
            if (!matchesNCERT) issues.push(`NAME MISMATCH: "${c.name}"`);
        }

        // Missing NCERT chapters
        const missingNCERT = ncertChapters.filter(nc =>
            !dbChapters.some(dc => dc.name === nc.name)
        );
        if (missingNCERT.length > 0) {
            console.log(`\n  Missing NCERT chapters:`);
            for (const mc of missingNCERT) {
                console.log(`    ❌ "${mc.name}" (Class ${mc.class_level})`);
                issues.push(`MISSING NCERT: "${mc.name}"`);
            }
        }

        console.log(`\n  📊 SUMMARY: ${totalPYQs} PYQs, ${totalMocks} mocks, ${dbChapters.length} chapters, ${issues.length} issues`);
        if (issues.length === 0) {
            console.log(`  ✅ ALL CLEAN — No issues found!`);
        } else {
            console.log(`  🔴 ${issues.length} issues need attention`);
        }
    }

    await db.close();
}

audit();
