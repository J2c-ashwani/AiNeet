const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // The mock-up container is exactly 280x560, but let's capture at 2x resolution (560x1120) for crispness.
        // Ensure the full vertical height of the scrollable HTML layout is captured
        await page.setViewport({ width: 320, height: 850, deviceScaleFactor: 2 });
        
        const fileUrl = 'file://' + path.resolve(__dirname, '../public/mockup_source.html');
        console.log("Loading", fileUrl);
        
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        // Wait a small moment for any fonts to explicitly render
        await new Promise(r => setTimeout(r, 1000));
        
        const dest = path.resolve(__dirname, '../public/mockup.png');
        
        const element = await page.$('.wrap');
        await element.screenshot({ path: dest });

        console.log("Screenshot saved perfectly to", dest);

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
