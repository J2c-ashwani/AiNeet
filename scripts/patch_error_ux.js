const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.js')) results.push(file);
    });
    return results;
}

// Contextual user-friendly messages keyed by route patterns
const contextMap = {
    'auth/register': 'Something went wrong during signup. Please try again.',
    'auth/login': 'Login failed. Please check your connection and try again.',
    'auth/me': 'Could not load your profile. Please refresh the page.',
    'auth/delete': 'Account deletion failed. Please try again later.',
    'tests/submit': 'Could not submit your test. Your answers are saved — please try again.',
    'tests/generate': 'Could not generate your test. Please try again in a few seconds.',
    'tests/adaptive': 'Could not load adaptive test. Please try again.',
    'tests/pyq': 'Could not load previous year questions. Please try again.',
    'tests/scorecard': 'Could not load your scorecard. Please refresh.',
    'doubt': 'AI is temporarily busy. Please try again in a few seconds.',
    'leaderboard': 'Could not load leaderboard. Please refresh.',
    'performance': 'Could not load your performance data. Please refresh.',
    'subscription': 'Payment processing issue. Please try again or contact support.',
    'admin': 'Admin operation failed. Please retry.',
    'battle': 'Battle operation failed. Please try again.',
    'battleground': 'Battleground error. Please try again.',
    'classroom': 'Classroom operation failed. Please try again.',
    'omr': 'Could not process your scan. Please try again.',
    'revision': 'Could not load revision data. Please refresh.',
    'ncert': 'Could not load NCERT content. Please try again.',
    'blueprint': 'Could not generate study plan. Please try again.',
    'coach': 'AI Coach is temporarily unavailable. Please try again.',
    'challenge': 'Challenge operation failed. Please try again.',
    'syllabus': 'Could not load syllabus. Please refresh.',
    'social': 'Social feature error. Please try again.',
    'questions/report': 'Could not submit your report. Please try again.',
    'user/': 'Could not update your settings. Please try again.',
    'webhooks': 'Webhook processing error.',
    'cron': 'Background task error.',
    'analytics': 'Analytics error.',
    'achievements': 'Could not load achievements. Please refresh.',
    'mistakes': 'Could not load mistake log. Please refresh.',
    'study-plan': 'Could not load study plan. Please refresh.',
};

function getContextualMessage(filePath) {
    for (const [pattern, message] of Object.entries(contextMap)) {
        if (filePath.includes(pattern)) return message;
    }
    return 'Something went wrong. Please try again in a moment.';
}

const files = walk('./app/api');
let patched = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const msg = getContextualMessage(file);
    
    // Replace "Internal server error" with contextual message
    if (content.includes("'Internal server error'")) {
        content = content.replaceAll("'Internal server error'", `'${msg}'`);
        fs.writeFileSync(file, content);
        patched++;
        console.log(`[PATCHED] ${file} → "${msg}"`);
    }
    
    // Replace generic "Failed to..." with contextual + retry hint
    const genericFailed = content.match(/'Failed to [^']+'/g);
    if (genericFailed) {
        genericFailed.forEach(match => {
            // Only replace if it doesn't already have "try again" language
            if (!match.includes('try again') && !match.includes('retry') && !match.includes('refresh')) {
                const newMsg = match.slice(0, -1) + '. Please try again in a moment.\'';
                content = content.replace(match, newMsg);
            }
        });
        fs.writeFileSync(file, content);
        patched++;
        console.log(`[PATCHED] ${file} → added retry hints`);
    }
});

console.log(`\nDone. Patched ${patched} files with contextual, user-friendly error messages.`);
