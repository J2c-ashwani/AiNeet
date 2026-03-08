/**
 * Extract REAL NEET Chemistry PYQs from chapter-wise PDFs
 * Usage: node scripts/extract_chemistry_pyqs.mjs
 * 
 * Reads PDFs from data/chemistry_pyqs/ and outputs data/chemistry_pyqs_extracted.json
 */
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractTextFromPdf(pdfPath) {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    const maxPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(' ') + '\n';
    }
    return fullText;
}

function parseQuestions(text, chapterName) {
    // 1. Clean up weird spacing
    text = text.replace(/\s+/g, ' ');

    // 2. Extract Answer Key
    let answerKey = {};
    const answerKeyMatch = text.match(/1\s+2\s+3.*?(a\s*|\s*b\s*|\s*c\s*|\s*d\s*)+\s*Answer Key/i);
    if (!answerKeyMatch) {
        const altMatch = text.match(/Answer Key\s*1\s+2.*?([abcd]\s+)+/i);
        if (altMatch) {
            const tokens = altMatch[0].replace('Answer Key', '').trim().split(/\s+/);
            const numbers = tokens.filter(t => !isNaN(t));
            const letters = tokens.filter(t => /^[abcd]$/i.test(t));
            numbers.forEach((n, idx) => {
                if (letters[idx]) answerKey[n] = letters[idx].toUpperCase();
            });
        } else {
            // Super generic look-back
            const endStr = text.substring(text.length - 2000);
            const lines = endStr.split(' ');
            let numsRow = [];
            let charsRow = [];
            for (let token of lines) {
                token = token.trim();
                if (!token) continue;
                if (!isNaN(token) && parseInt(token) > 0 && parseInt(token) < 200) {
                    numsRow.push(token);
                } else if (/^[abcd]$/i.test(token)) {
                    charsRow.push(token);
                }
            }
            if (numsRow.length > 0 && charsRow.length >= numsRow.length - 5) {
                for (let i = 0; i < numsRow.length; i++) {
                    if (charsRow[i]) answerKey[numsRow[i]] = charsRow[i].toUpperCase();
                }
            }
        }
    } else {
        const keySection = text.substring(text.indexOf('1 2 3'), text.lastIndexOf('Answer Key'));
        const tokens = keySection.split(/\s+/);
        const numbers = tokens.filter(t => !isNaN(t));
        const letters = tokens.filter(t => /^[abcd]$/i.test(t));
        numbers.forEach((n, idx) => {
            if (letters[idx]) answerKey[n] = letters[idx].toUpperCase();
        });
    }

    // 3. Extract Questions
    const questionBlocks = text.split(/(?=\b\d+\.\s+)/);

    let questions = [];

    for (let block of questionBlocks) {
        const qMatch = block.match(/^(\d+)\.\s+(.*)/);
        if (!qMatch) continue;

        const qNumber = qMatch[1];
        let qBody = qMatch[2];

        let optionA = "Option A", optionB = "Option B", optionC = "Option C", optionD = "Option D";
        let textPart = qBody;

        // Find where options start
        // Try (a) (b) (c) (d) format first
        let aIndex = qBody.search(/\(a\)\s/i);
        if (aIndex === -1) {
            // Try a. b. c. d. format
            aIndex = qBody.search(/\ba\.\s/);
        }
        if (aIndex === -1) {
            // Try (1) (2) (3) (4) format
            aIndex = qBody.search(/\(1\)\s/);
        }

        if (aIndex !== -1) {
            textPart = qBody.substring(0, aIndex).trim();
            const optsPart = qBody.substring(aIndex);

            // Try (a) (b) (c) (d) format
            let opts = optsPart.split(/\([abcd1234]\)\s*/i).filter(Boolean).map(s => s.trim());
            if (opts.length < 4) {
                // Try a. b. c. d. format
                opts = optsPart.split(/\b[abcd]\.\s*/i).filter(Boolean).map(s => s.trim());
            }
            if (opts.length >= 4) {
                optionA = opts[0];
                optionB = opts[1];
                optionC = opts[2];
                optionD = opts[3];
            } else {
                optionA = optsPart;
            }
        }

        let yearMatch = textPart.match(/\((20\d\d[^\)]*)\)/);
        let year = "2020";
        if (yearMatch) year = yearMatch[1].split('-')[0].trim();

        questions.push({
            chapter: chapterName,
            topic: 'Previous Year Question',
            difficulty: 'neet',
            year_asked: year,
            text: textPart,
            options: [optionA, optionB, optionC, optionD],
            correct: answerKey[qNumber] || 'A',
            explanation: 'PYQ Question'
        });
    }

    return questions;
}

async function main() {
    const dir = 'data/chemistry_pyqs';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

    let allPyqs = [];

    for (const file of files) {
        // file format: hash_##_Chapter Name : PYQs ~ Chemistry Type.pdf
        let chapterNameMatch = file.match(/_##_(.*?) : PYQs/);
        let chapterName = chapterNameMatch ? chapterNameMatch[1].trim() : file.replace('.pdf', '');

        console.log(`Processing: ${chapterName}`);

        try {
            const rawText = await extractTextFromPdf(path.join(dir, file));
            const qs = parseQuestions(rawText, chapterName);
            console.log(`  Extracted ${qs.length} questions`);
            allPyqs.push(...qs);
        } catch (e) {
            console.error(`  Failed on ${file}: ${e.message}`);
        }
    }

    fs.writeFileSync('data/chemistry_pyqs_extracted.json', JSON.stringify({ CHEMISTRY_EXTRA: allPyqs }, null, 2));
    console.log(`\nSaved ${allPyqs.length} total questions to data/chemistry_pyqs_extracted.json`);
}

main();
