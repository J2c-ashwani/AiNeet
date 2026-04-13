import fs from 'fs';
import path from 'path';

function walkDir(dir, filterFunc) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    let list = fs.readdirSync(dir);
    list.forEach(file => {
        let fullPath = path.join(dir, file);
        let stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath, filterFunc));
        } else if (filterFunc(fullPath)) {
            results.push(fullPath);
        }
    });
    return results;
}

const apiRoutes = walkDir('./app/api', f => f.endsWith('route.js'));
const pages = walkDir('./app', f => f.endsWith('page.js') && !f.includes('/api/'));

const systemMap = {
    api_routes: apiRoutes.map(p => ({ path: p, status: 'ACTIVE', criticality: 'CRITICAL' })),
    pages: pages.map(p => ({ path: p, status: 'ACTIVE', criticality: 'CRITICAL' })),
    database_tables: [
        'users', 'tests', 'payments', 'leaderboard', 'mistake_log', 'questions', 
        'user_performance', 'battles', 'question_reports', 'user_achievements', 
        'ncert_books', 'doubt_conversations', 'battleground_participants'
    ].map(t => ({ name: t, status: 'ACTIVE', criticality: 'CRITICAL' })),
    integrations: [
        { name: 'Supabase Auth', status: 'ACTIVE', criticality: 'CRITICAL' },
        { name: 'Supabase Database', status: 'ACTIVE', criticality: 'CRITICAL' },
        { name: 'Sentry', status: 'ACTIVE', criticality: 'CRITICAL' },
        { name: 'Cashfree', status: 'ACTIVE', criticality: 'CRITICAL' },
        { name: 'Gemini/Groq AI', status: 'ACTIVE', criticality: 'CRITICAL' }
    ]
};

const orphaned = [];
apiRoutes.forEach(route => {
    const content = fs.readFileSync(route, 'utf8');
    // If it's returning a hardcoded "coming soon" or is literally empty
    if (content.includes('TODO:') || content.includes('Placeholder') || content.includes('Coming soon') || content.length < 50) {
        systemMap.api_routes.find(r => r.path === route).status = 'ORPHAN';
        orphaned.push(route);
    }
});

fs.writeFileSync('system_map.json', JSON.stringify(systemMap, null, 2));
console.log(`Audited ${apiRoutes.length} API routes, ${pages.length} Pages.`);
console.log(`Orphaned routes found: ${orphaned.length}`);
console.log(orphaned.join('\n'));
