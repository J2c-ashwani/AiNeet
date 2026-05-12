'use client';

/**
 * lib/telemetry/performance.js
 *
 * Attaches runtime performance observers for ANR early warning,
 * memory pressure detection, and long task logging.
 * All events are buffered via mobile-buffer.js (offline-safe).
 */

import { bufferEvent } from './mobile-buffer';

export function attachPerformanceTelemetry() {
    if (typeof window === 'undefined') return;

    // 1. Long Task Observer — ANR early warning (> 200ms blocks main thread)
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries()
                    .filter(e => e.duration > 200)
                    .forEach(e => {
                        bufferEvent({
                            event_type:     'long_task',
                            route:          window.location?.pathname,
                            failure_reason: `Long task: ${e.duration.toFixed(0)}ms`
                        });
                    });
            });
            observer.observe({ entryTypes: ['longtask'] });
        } catch { /* Not supported on all WebViews */ }
    }

    // 2. Memory Pressure — Chrome/Android only
    if (performance?.memory) {
        const CHECK_INTERVAL_MS = 15000; // Every 15s
        const HEAP_LIMIT_MB = 120;

        setInterval(() => {
            const heapMB = performance.memory.usedJSHeapSize / 1024 / 1024;
            if (heapMB > HEAP_LIMIT_MB) {
                bufferEvent({
                    event_type:     'memory_pressure',
                    route:          window.location?.pathname,
                    failure_reason: `Heap: ${heapMB.toFixed(1)}MB > ${HEAP_LIMIT_MB}MB limit`
                });
            }
        }, CHECK_INTERVAL_MS);
    }

    // 3. Hydration Recovery — log any client-side navigation errors
    window.addEventListener('error', (e) => {
        if (e.message?.includes('Hydration') || e.message?.includes('hydrat')) {
            bufferEvent({
                event_type:     'hydration_error',
                route:          window.location?.pathname,
                failure_reason: e.message?.substring(0, 300)
            });
        }
    });

    // 4. Unhandled promise rejections — catch silent crashes
    window.addEventListener('unhandledrejection', (e) => {
        bufferEvent({
            event_type:     'unhandled_rejection',
            route:          window.location?.pathname,
            failure_reason: String(e.reason)?.substring(0, 300)
        });
    });
}
