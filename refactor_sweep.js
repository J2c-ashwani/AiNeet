const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./app/api');

let patchedAware = 0;
let patchedSupabase = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // PATCH 1: Await bug
    if (content.match(/const\s+\w+\s*=\s*getUserFromRequest\(/)) {
        content = content.replace(/const\s+(\w+)\s*=\s*getUserFromRequest\(/g, 'const $1 = await getUserFromRequest(');
        changed = true;
        patchedAware++;
    }

    // PATCH 2: Supabase Standardization (getSupabase => getDb)
    if (content.includes('getSupabase();') || content.includes('getSupabase()')) {
        content = content.replace(/import\s+\{\s*getSupabase\s*\}\s+from\s+['"]@\/lib\/supabase['"];?/g, "import { getDb } from '@/lib/core/db';");
        content = content.replace(/import\s+\{\s*getSupabase\s*,\s*/g, "import { getDb, ");
        content = content.replace(/const\s+(\w+)\s*=\s*getSupabase\(\);?/g, 'const $1 = await getDb();');
        content = content.replace(/getSupabase\(\)/g, "await getDb()");
        changed = true;
        patchedSupabase++;
    }

    // PATCH 3: Import auth from core
    if (content.includes('@/lib/auth')) {
        content = content.replace(/@\/lib\/auth/g, '@/lib/core/auth');
        changed = true;
    }

    // PATCH 4: createSupabaseServerClient -> getDb
    if (content.includes('createSupabaseServerClient')) {
        content = content.replace(/import\s+\{\s*createSupabaseServerClient\s*\}\s+from\s+['"]@\/utils\/supabase\/server['"];?/g, "import { getDb } from '@/lib/core/db';");
        content = content.replace(/createSupabaseServerClient\(\)/g, "getDb()");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`[PATCHED] ${file}`);
    }
});

console.log(`\nDONE. Patched Awaits: ${patchedAware}. Patched Supabase Clients: ${patchedSupabase}.`);
