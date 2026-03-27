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
    text = text.replace(/\s+/g, ' ');

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

    const questionBlocks = text.split(/(?=\b\d+\.\s+)/);
    let questions = [];

    for (let block of questionBlocks) {
        const qMatch = block.match(/^(\d+)\.\s+(.*)/);
        if (!qMatch) continue;

        const qNumber = qMatch[1];
        let qBody = qMatch[2];

        let optionA = "Option A", optionB = "Option B", optionC = "Option C", optionD = "Option D";
        let textPart = qBody;

        const aIndex = qBody.search(/\ba\.\s/);
        if (aIndex !== -1) {
            textPart = qBody.substring(0, aIndex).trim();
            const optsPart = qBody.substring(aIndex);

            let opts = optsPart.split(/\b[abcd]\.\s*/i).filter(Boolean).map(s => s.trim());
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
    const dir = '/Users/ashwanikumar/Desktop/neetcoach/Chemistry';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

    let allPyqs = [];

    for (const file of files) {
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
    console.log(`Saved ${allPyqs.length} total questions to data/chemistry_pyqs_extracted.json`);
}

main();
