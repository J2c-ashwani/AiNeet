
// Script to manually trigger weekly reports (Testing)

// Mock Fetch if running in node without polyfill (Next.js scripts might need special handling)
// But for simplicity, we can just call the library logic directly if we setup DB.
// Or we can use `fetch` if node version supports it (Node 18+).

async function trigger() {
    console.log('Triggering Weekly Report Cron via API...');
    try {
        const res = await fetch('http://localhost:3000/api/cron/weekly-report', {
            headers: { 'Authorization': 'Bearer dev_secret' }
        });
        const data = await res.json();
        console.log('Result:', data);
    } catch (e) {
        console.error('Failed to trigger:', e.message);
        console.log('Ensure the server is running at localhost:3000');
    }
}

trigger();
