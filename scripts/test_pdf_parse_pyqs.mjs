import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

async function testParse() {
    const dataBuffer = fs.readFileSync('yearly_pyq_2013_2025.pdf');
    try {
        const data = await pdf(dataBuffer, { max: 10 }); // parse first 10 pages
        console.log(`Number of pages: ${data.numpages}`);
        console.log(`Extracted text preview:\n${data.text.substring(0, 500)}`);

        if (data.text.trim().length < 100) {
            console.log("WARNING: Extracted text is very short. This might be a scanned image PDF.");
        } else {
            console.log("SUCCESS: Text seems to be extractable!");
        }
    } catch (e) {
        console.error("Error parsing PDF:", e);
    }
}

testParse();
