const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractText(pdfUrl) {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const maxPages = pdf.numPages;
        let text = '';

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            text += strings.join(' ') + '\n';
        }
        console.log(text.substring(0, 2000));
    } catch (e) {
        console.error(e);
    }
}

extractText(process.argv[2]);
