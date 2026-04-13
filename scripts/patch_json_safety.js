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
let patched = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Skip the register route — already fixed manually
    if (file.includes('auth/register')) return;
    
    // Pattern: destructuring directly from request.json() without try/catch
    // Match patterns like:
    //   const { ... } = await request.json();
    //   const body = await request.json();
    const jsonParseRegex = /^(\s*)(const\s+(?:\{[^}]+\}|\w+)\s*=\s*)await request\.json\(\);/gm;
    
    if (content.match(jsonParseRegex)) {
        // Check if there's already a safe wrapper
        if (content.includes("} catch (parseErr)") || content.includes("catch (jsonErr)")) {
            return; // Already patched
        }
        
        content = content.replace(jsonParseRegex, (match, indent, assignment) => {
            // Extract the variable part (either destructured or simple)
            const varPart = assignment.trim();
            
            // If it's destructuring like: const { testId, answers } = ...
            if (varPart.includes('{')) {
                const destructure = varPart.match(/const\s+(\{[^}]+\})/);
                if (destructure) {
                    return `${indent}let _body;\n${indent}try { _body = await request.json(); } catch (parseErr) {\n${indent}    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });\n${indent}}\n${indent}const ${destructure[1]} = _body;`;
                }
            }
            
            // If it's simple assignment like: const body = ...
            return `${indent}let _body;\n${indent}try { _body = await request.json(); } catch (parseErr) {\n${indent}    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });\n${indent}}\n${indent}const body = _body;`;
        });
        
        fs.writeFileSync(file, content);
        patched++;
        console.log(`[PATCHED] ${file}`);
    }
});

console.log(`\nDONE. Patched ${patched} routes for JSON parse safety.`);
