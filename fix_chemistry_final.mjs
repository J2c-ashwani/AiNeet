import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

import { getDb } from './lib/db.js';
const db = getDb();

async function fix() {
    const subject = await db.get('SELECT id FROM subjects WHERE name = ?', ['Chemistry']);
    if (!subject) { console.log("No Chemistry subject found!"); return; }
    const subjectId = subject.id;

    // Step 1: Rename chapters to match EXACT NCERT_BOOKS names
    const renames = {
        'Chemical Bonding': 'Chemical Bonding and Molecular Structure',
        'Classification of Elements': 'Classification of Elements and Periodicity in Properties',
        'Organic Chemistry Basics': 'Organic Chemistry: Some Basic Principles and Techniques',
        'Haloalkanes & Haloarenes': 'Haloalkanes and Haloarenes',
        'Alcohols, Phenols & Ethers': 'Alcohols, Phenols and Ethers',
        'Aldehydes, Ketones & Carboxylic Acids': 'Aldehydes, Ketones and Carboxylic Acids',
        'd- and f-Block Elements': 'The d- and f-Block Elements',
        'p-Block Elements (12)': 'The p-Block Elements',  // Class 12 p-Block
    };

    console.log("=== Step 1: Renaming chapters to exact NCERT names ===");
    for (const [oldName, newName] of Object.entries(renames)) {
        const chap = await db.get('SELECT id FROM chapters WHERE name = ? AND subject_id = ?', [oldName, subjectId]);
        if (chap) {
            // Check if the newName already exists (to avoid duplicates)
            const existing = await db.get('SELECT id FROM chapters WHERE name = ? AND subject_id = ?', [newName, subjectId]);
            if (existing) {
                // Move questions from old to existing, then delete old
                await db.run('UPDATE questions SET chapter_id = ? WHERE chapter_id = ?', [existing.id, chap.id]);
                await db.run('DELETE FROM topics WHERE chapter_id = ?', [chap.id]);
                await db.run('DELETE FROM chapters WHERE id = ?', [chap.id]);
                console.log(`  Merged "${oldName}" → "${newName}"`);
            } else {
                await db.run('UPDATE chapters SET name = ? WHERE id = ?', [newName, chap.id]);
                console.log(`  Renamed "${oldName}" → "${newName}"`);
            }
        }
    }

    // Step 2: Fix class_level for Class 12 chapters (currently all set to 11)
    const class12Chapters = [
        'The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics',
        'Surface Chemistry', 'General Principles and Processes of Isolation of Elements',
        'The p-Block Elements', 'The d- and f-Block Elements', 'Coordination Compounds',
        'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers',
        'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules',
        'Polymers', 'Chemistry in Everyday Life'
    ];

    console.log("\n=== Step 2: Fixing class_level for Class 12 chapters ===");
    for (const name of class12Chapters) {
        const chap = await db.get('SELECT id, class_level FROM chapters WHERE name = ? AND subject_id = ?', [name, subjectId]);
        if (chap && chap.class_level !== 12) {
            await db.run('UPDATE chapters SET class_level = 12 WHERE id = ?', [chap.id]);
            console.log(`  Fixed class_level: "${name}" → Class 12`);
        }
    }

    // Step 3: Create any missing NCERT chapters
    const allNCERTChemistry = [
        // Class 11
        { name: 'Some Basic Concepts of Chemistry', class_level: 11 },
        { name: 'Structure of Atom', class_level: 11 },
        { name: 'Classification of Elements and Periodicity in Properties', class_level: 11 },
        { name: 'Chemical Bonding and Molecular Structure', class_level: 11 },
        { name: 'States of Matter', class_level: 11 },
        { name: 'Thermodynamics', class_level: 11 },
        { name: 'Equilibrium', class_level: 11 },
        { name: 'Redox Reactions', class_level: 11 },
        { name: 'Hydrogen', class_level: 11 },
        { name: 'The s-Block Elements', class_level: 11 },
        { name: 'The p-Block Elements', class_level: 11 },
        { name: 'Organic Chemistry: Some Basic Principles and Techniques', class_level: 11 },
        { name: 'Hydrocarbons', class_level: 11 },
        { name: 'Environmental Chemistry', class_level: 11 },
        // Class 12
        { name: 'The Solid State', class_level: 12 },
        { name: 'Solutions', class_level: 12 },
        { name: 'Electrochemistry', class_level: 12 },
        { name: 'Chemical Kinetics', class_level: 12 },
        { name: 'Surface Chemistry', class_level: 12 },
        { name: 'General Principles and Processes of Isolation of Elements', class_level: 12 },
        { name: 'The d- and f-Block Elements', class_level: 12 },
        { name: 'Coordination Compounds', class_level: 12 },
        { name: 'Haloalkanes and Haloarenes', class_level: 12 },
        { name: 'Alcohols, Phenols and Ethers', class_level: 12 },
        { name: 'Aldehydes, Ketones and Carboxylic Acids', class_level: 12 },
        { name: 'Amines', class_level: 12 },
        { name: 'Biomolecules', class_level: 12 },
        { name: 'Polymers', class_level: 12 },
        { name: 'Chemistry in Everyday Life', class_level: 12 },
    ];

    // Note: "The p-Block Elements" exists for BOTH Class 11 and Class 12 in NCERT
    // We already have one for Class 12 (with PYQs). We need to ensure Class 11 also exists.

    console.log("\n=== Step 3: Creating any missing NCERT chapters ===");
    for (const ch of allNCERTChemistry) {
        const existing = await db.get(
            'SELECT id FROM chapters WHERE name = ? AND subject_id = ? AND class_level = ?',
            [ch.name, subjectId, ch.class_level]
        );
        if (!existing) {
            // Check if it exists with wrong class_level
            const wrongLevel = await db.get(
                'SELECT id, class_level FROM chapters WHERE name = ? AND subject_id = ?',
                [ch.name, subjectId]
            );
            if (wrongLevel) {
                // Already handled above in Step 2, skip
                continue;
            }
            await db.run('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES (?, ?, ?, 0)', [subjectId, ch.name, ch.class_level]);
            console.log(`  Created missing chapter: "${ch.name}" (Class ${ch.class_level})`);
        }
    }

    // Step 4: Remove mock Chemistry questions
    const mockCount = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE subject_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [subjectId]);
    if (mockCount.cnt > 0) {
        console.log(`\n=== Step 4: Removing ${mockCount.cnt} mock Chemistry questions ===`);
        await db.run('DELETE FROM questions WHERE subject_id = ? AND (is_pyq = 0 OR is_pyq IS NULL)', [subjectId]);
        console.log("  ✅ Mock questions removed.");
    }

    // Step 5: Final verification
    console.log("\n=== FINAL STATE ===");
    const chapters = await db.all('SELECT id, name, class_level FROM chapters WHERE subject_id = ? ORDER BY class_level, name', [subjectId]);
    let totalPYQs = 0;
    for (const c of chapters) {
        const cnt = await db.get('SELECT COUNT(*) as cnt FROM questions WHERE chapter_id = ?', [c.id]);
        const label = cnt.cnt > 0 ? `${cnt.cnt} PYQs` : 'No PYQs (no PDF available)';
        console.log(`[Class ${c.class_level}] "${c.name}" — ${label}`);
        totalPYQs += cnt.cnt;
    }
    console.log(`\nTotal Chemistry chapters: ${chapters.length}`);
    console.log(`Total Chemistry PYQs: ${totalPYQs}`);
    console.log("🎉 All done!");

    await db.close();
}

fix();
