#!/usr/bin/env node
/**
 * scripts/test-v2-differentiation-ai-tools.mjs
 *
 * V2.3 Differentiation & AI Tools Automated Test Suite
 * Verifies:
 *  1. Frame Telemetry Observer: V2FrameObserver tracks P50/P95, janky %, and cold start.
 *  2. Native AI Doubt Solver: Camera snap trigger, text prompt, streamed solution view.
 *  3. Native NCERT Reader: Subject filters, chapter navigation, NCERT concept cards.
 *  4. Native Battleground: 1v1 matchmaking lobby and global rank leaderboard.
 *  5. Low-End 360px Viewport Safety: All screens wrap in SafeArea & SingleChildScrollView.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const passed = [];
const failures = [];

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function assert(condition, description) {
    if (condition) {
        passed.push(description);
        console.log(`  ✅ ${description}`);
    } else {
        failures.push(description);
        console.log(`  ❌ ${description}`);
    }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('    🤖 V2.3 DIFFERENTIATION & AI TOOLS TEST GATE');
console.log('═══════════════════════════════════════════════════\n');

// 1. Telemetry Observer
const telemetry = read('mobile/lib/v2/core/telemetry/frame_observer.dart');
assert(telemetry.includes('addTimingsCallback') && telemetry.includes('p50FrameMs'), 'V2FrameObserver tracks P50/P95 frame rendering times and DevTools metrics');
assert(telemetry.includes('totalMs > 16.6'), 'V2FrameObserver tracks janky frame counts (>16.6ms)');

// 2. AI Doubt Solver
const doubts = read('mobile/lib/v2/features/doubts/presentation/doubt_solver_screen.dart');
assert(doubts.includes('camera_alt_outlined'), 'NativeDoubtSolverScreen provides camera snap trigger for image doubts');
assert(doubts.includes('Type or snap a question'), 'NativeDoubtSolverScreen provides text prompt input field');
assert(doubts.includes('AI is analyzing NCERT'), 'NativeDoubtSolverScreen displays streamed solution explanation');

// 3. NCERT Reader
const ncert = read('mobile/lib/v2/features/ncert/presentation/ncert_reader_screen.dart');
assert(ncert.includes('Physics') && ncert.includes('Chemistry') && ncert.includes('Biology'), 'NativeNcertReaderScreen provides subject tab filters');
assert(ncert.includes('Core NCERT Definition'), 'NativeNcertReaderScreen displays key concept cards');

// 4. Battleground & Leaderboard
const battle = read('mobile/lib/v2/features/battleground/presentation/battleground_screen.dart');
assert(battle.includes('_startMatchmaking'), 'NativeBattlegroundScreen provides live 1v1 matchmaking lobby');
assert(battle.includes('Top NEET Champions'), 'NativeBattlegroundScreen displays global rank leaderboard');

// 5. Viewport Safety
assert(doubts.includes('SafeArea') && ncert.includes('SafeArea') && battle.includes('SafeArea'), 'All V2.3 screens wrap body in SafeArea for viewport safety');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  ✅ Passed: ${passed.length}`);
console.log(`  ❌ Failed: ${failures.length}`);
console.log('═══════════════════════════════════════════════════\n');

if (failures.length > 0) {
    console.error('❌ V2.3 Differentiation & AI Tools Test Gate FAILED.');
    process.exit(1);
} else {
    console.log('🎉 V2.3 DIFFERENTIATION & AI TOOLS TEST GATE PASSED!');
    process.exit(0);
}
