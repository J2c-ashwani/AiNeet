'use client';

/**
 * lib/utils/whatsapp.js
 *
 * The ONLY way pages should trigger a WhatsApp share.
 * Replaces all raw window.open(wa.me) calls across the codebase.
 * In native app: routes via Flutter Android Intent.
 * In browser: uses window.open normally.
 */

import { openExternalUrl, safePostIntent, supportsCapability } from '@/lib/platform';
import { bufferEvent } from '@/lib/telemetry/mobile-buffer';

export function openWhatsAppShare(text) {
    const encoded = encodeURIComponent(text);

    if (supportsCapability('externalIntent')) {
        // Route via Flutter — Android Intent handles whatsapp:// URI natively
        safePostIntent('OPEN_URL', { url: `whatsapp://send?text=${encoded}` })
            .catch(e => {
                // On bridge timeout or error, fallback to wa.me (browser deep link)
                bufferEvent({ event_type: 'whatsapp_intent_failed', failure_reason: e.message });
                openExternalUrl(`https://wa.me/?text=${encoded}`);
            });
    } else {
        openExternalUrl(`https://wa.me/?text=${encoded}`);
    }
}
