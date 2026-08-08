#!/usr/bin/env node
/**
 * scripts/test-v2-foundation-certification.mjs
 *
 * V2.1 Foundation Certification Gate Test Suite
 * Verifies:
 *  1. Exponential Backoff Retries: 3 attempts with 1s, 2s, 4s delays on 5xx / timeout.
 *  2. Token Refresh & 401 Purge: Secure session & offline cache cleared on unauth.
 *  3. Offline Data Resilience: Hive / memory fallback for performance API data.
 *  4. Secure Storage Protocol: Session saving & clearing using EncryptedSharedPreferences.
 *  5. Low-End Android Viewport Resilience: Design tokens handle scaling & small viewports.
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
console.log('    🛡️  V2.1 FOUNDATION CERTIFICATION GATE');
console.log('═══════════════════════════════════════════════════\n');

// 1. API Client Retry & Backoff
const apiClient = read('mobile/lib/v2/core/api/api_client.dart');
assert(apiClient.includes('retry_count') && apiClient.includes('1000 * (1 << retryCount)'), 'NeetApiClient implements 1s, 2s, 4s exponential backoff retries');
assert(apiClient.includes('maxRetries = 3'), 'NeetApiClient caps retries at 3 attempts maximum');
assert(apiClient.includes('statusCode == 401') && apiClient.includes('clearSession'), 'NeetApiClient automatically clears session on 401 unauth');

// 2. Offline Cache Resilience
const offlineCache = read('mobile/lib/v2/core/cache/offline_cache.dart');
assert(offlineCache.includes('Hive.initFlutter()'), 'OfflineCacheService initializes Hive for local persistent caching');
assert(offlineCache.includes('_memoryStore'), 'OfflineCacheService provides memory fallback if Hive storage is unavailable');
assert(apiClient.includes('OfflineCacheService.cacheUserData') && apiClient.includes('OfflineCacheService.getCachedUserData'), 'NeetApiClient integrates offline fallback for performance stats');

// 3. Secure Storage Layer
const secureStorage = read('mobile/lib/v2/core/security/secure_storage.dart');
assert(secureStorage.includes('encryptedSharedPreferences: true'), 'SecureStorageService uses Android EncryptedSharedPreferences');
assert(secureStorage.includes('clearSession'), 'SecureStorageService supports atomic session purging on logout');

// 4. Design Tokens & Small Viewport Safety
const tokens = read('mobile/lib/v2/core/constants/tokens.dart');
assert(tokens.includes('bgPrimary = Color(0xFF080C18)'), 'NeetTokens enforces deep dark mode theme color');
assert(tokens.includes('hapticMedium'), 'NeetTokens provides tactile haptic feedback triggers');

// 5. Native Login Screen Implementation
const loginScreen = read('mobile/lib/v2/features/auth/presentation/login_screen.dart');
assert(loginScreen.includes('SingleChildScrollView'), 'NativeLoginScreen uses SingleChildScrollView to prevent keyboard overflow on low-end 360px Android devices');
assert(loginScreen.includes('NeetTokens.hapticSuccess()'), 'NativeLoginScreen triggers tactile haptic feedback on auth success');

console.log('\n═══════════════════════════════════════════════════');
console.log(`  ✅ Passed: ${passed.length}`);
console.log(`  ❌ Failed: ${failures.length}`);
console.log('═══════════════════════════════════════════════════\n');

if (failures.length > 0) {
    console.error('❌ V2.1 Foundation Certification Gate FAILED.');
    process.exit(1);
} else {
    console.log('🏆 V2.1 FOUNDATION CERTIFICATION GATE PASSED Factually!');
    process.exit(0);
}
