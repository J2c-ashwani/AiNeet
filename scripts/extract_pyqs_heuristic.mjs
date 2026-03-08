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
        // Just join strings with spaces for now
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
        // Look for "Answer Key 1 2 3 ... a b c d" format
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
            // Try to zip them from the end
            if (numsRow.length > 0 && charsRow.length >= numsRow.length - 5) { // rough match
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
    // Matches "1. ", "12. " but not 3.14
    const questionBlocks = text.split(/(?=\b\d+\.\s+)/);

    let questions = [];

    for (let block of questionBlocks) {
        const qMatch = block.match(/^(\d+)\.\s+(.*)/);
        if (!qMatch) continue;

        const qNumber = qMatch[1];
        let qBody = qMatch[2];

        // We need to find options: a. b. c. d.
        // The pattern is a. xxx b. yyy c. zzz d. www
        const optionRegex = /a\.\s*(.*?)\s*b\.\s*(.*?)\s*c\.\s*(.*?)\s*d\.\s*(.*?)$/i;

        let optionA = "Option A", optionB = "Option B", optionC = "Option C", optionD = "Option D";
        let textPart = qBody;

        // Find where 'a.' starts roughly
        const aIndex = qBody.search(/\ba\.\s/);
        if (aIndex !== -1) {
            textPart = qBody.substring(0, aIndex).trim();
            const optsPart = qBody.substring(aIndex);

            // Try extracting options individually
            let opts = optsPart.split(/\b[abcd]\.\s*/i).filter(Boolean).map(s => s.trim());
            if (opts.length >= 4) {
                optionA = opts[0];
                optionB = opts[1];
                optionC = opts[2];
                optionD = opts[3];
            } else {
                optionA = optsPart; // fall back just throw everything
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
            text: textPart, // clean text
            options: [optionA, optionB, optionC, optionD],
            correct: answerKey[qNumber] || 'A',
            explanation: 'PYQ Question'
        });
    }

    return questions;
}

async function main() {
    const dir = 'data/physics_pyqs';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

    let allPyqs = [];

    for (const file of files) {
        // file format: hash_##_Chapter Name : PYQs ~ Physics.pdf
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

    fs.writeFileSync('data/physics_pyqs_extracted.json', JSON.stringify({ PHYSICS_EXTRA: allPyqs }, null, 2));
    console.log(`Saved ${allPyqs.length} total questions to data/physics_pyqs_extracted.json`);
}

main();
