'use client';

/**
 * lib/utils/clipboard.js
 *
 * Best-effort clipboard utility.
 * Failures are ALWAYS silent — never crash, never error modal.
 * Android OEM clipboard behavior is wildly inconsistent.
 */

import { supportsCapability, safePostIntent } from '@/lib/platform';

export async function copyToClipboard(text) {
    try {
        // Route 1: Flutter native clipboard manager
        if (supportsCapability('clipboard')) {
            await safePostIntent('COPY', { text });
            return;
        }

        // Route 2: Modern Clipboard API (browser)
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        // Route 3: Legacy textarea trick (Android 4.x WebViews, old browsers)
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

    } catch {
        // Intentionally silent — reliability > correctness
        // User can manually select and copy if needed
    }
}
