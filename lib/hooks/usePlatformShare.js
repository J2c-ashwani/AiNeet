'use client';

/**
 * lib/hooks/usePlatformShare.js
 *
 * The ONLY way pages should trigger a share action.
 * Internally routes to: Flutter bridge → navigator.share → clipboard fallback.
 */

import { supportsCapability, safePostIntent } from '@/lib/platform';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { bufferEvent } from '@/lib/telemetry/mobile-buffer';

export function usePlatformShare() {
    const share = async ({ title, text, url }) => {
        // Route 1: Flutter native share sheet
        if (supportsCapability('share')) {
            try {
                await safePostIntent('SHARE', { title, text, url: url || '' });
                return;
            } catch (e) {
                bufferEvent({ event_type: 'share_failed', failure_reason: e.message });
                // Fall through to next route
            }
        }

        // Route 2: Web Share API (browser)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch (e) {
                if (e.name === 'AbortError') return; // User cancelled — not a failure
                bufferEvent({ event_type: 'share_failed', failure_reason: e.message });
                // Fall through to clipboard fallback
            }
        }

        // Route 3: Clipboard fallback (best-effort, silent on failure)
        await copyToClipboard(url || text);
    };

    return { share };
}
