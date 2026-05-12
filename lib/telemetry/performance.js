'use client';
/**
 * lib/telemetry/performance.js — Full Production Performance Monitor
 *
 * Tracks: JS heap trend, FPS degradation, GC pressure, hydration timing,
 * render-blocking routes, ANR precursors (long tasks).
 *
 * Runtime Mitigation: When heap > 120MB, automatically suspends
 * non-critical operations to prevent OOM kills on low-end Android.
 */

const HEAP_LIMIT_MB      = 120;
const LONG_TASK_MS       = 200;
const FPS_SAMPLE_INTERVAL = 2000;
const HEAP_SAMPLE_INTERVAL = 10000;

let _attached = false;
let _fpsFrameId = null;
let _heapTimer  = null;
let _heapHistory = [];   // Rolling 5-sample trend
let _fpsLast = performance.now();
let _fpsFrameCount = 0;
let _gcPressureCount = 0;
let _lastHeapMB = 0;
let _mitigationActive = false;

// ── Public API ──────────────────────────────────────────────────────────────

export function attachPerformanceTelemetry() {
    if (_attached || typeof window === 'undefined') return;
    _attached = true;

    _attachLongTaskObserver();
    _attachFPSSampler();
    _attachHeapMonitor();
    _attachHydrationTiming();
    _attachUnhandledRejectionCapture();
}

export function detachPerformanceTelemetry() {
    _attached = false;
    if (_fpsFrameId) cancelAnimationFrame(_fpsFrameId);
    if (_heapTimer)  clearInterval(_heapTimer);
    _fpsFrameId = null;
    _heapTimer  = null;
}

export function isMitigationActive() { return _mitigationActive; }

// ── Long Task Observer (ANR Precursor) ─────────────────────────────────────

function _attachLongTaskObserver() {
    try {
        const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration >= LONG_TASK_MS) {
                    _emit('long_task', `${Math.round(entry.duration)}ms on ${entry.attribution?.[0]?.containerSrc || 'main'}`);
                }
            }
        });
        obs.observe({ type: 'longtask', buffered: true });
    } catch { /* Browser doesn't support longtask */ }
}

// ── FPS Degradation Sampler ─────────────────────────────────────────────────

function _attachFPSSampler() {
    const sample = (now) => {
        _fpsFrameCount++;
        if (now - _fpsLast >= FPS_SAMPLE_INTERVAL) {
            const fps = Math.round((_fpsFrameCount * 1000) / (now - _fpsLast));
            _fpsLast = now;
            _fpsFrameCount = 0;

            if (fps < 20) {
                _emit('fps_degradation', `${fps} FPS — severe jank detected`);
            } else if (fps < 40) {
                _emit('fps_degradation', `${fps} FPS — moderate jank`);
            }
        }
        if (_attached) _fpsFrameId = requestAnimationFrame(sample);
    };
    _fpsFrameId = requestAnimationFrame(sample);
}

// ── Heap Monitor + GC Pressure + Mitigation ────────────────────────────────

function _attachHeapMonitor() {
    _heapTimer = setInterval(() => {
        if (!performance.memory) return; // Chrome/Android WebView only

        const heapMB = performance.memory.usedJSHeapSize / (1024 * 1024);

        // GC pressure: heap dropped significantly (GC ran)
        if (_lastHeapMB > 0 && heapMB < _lastHeapMB * 0.7) {
            _gcPressureCount++;
            if (_gcPressureCount >= 3) {
                _emit('gc_pressure', `Repeated GC — heap fluctuating ${Math.round(_lastHeapMB)}→${Math.round(heapMB)}MB`);
                _gcPressureCount = 0;
            }
        }

        // Heap trend (5-sample rolling window)
        _heapHistory.push(heapMB);
        if (_heapHistory.length > 5) _heapHistory.shift();
        const trend = _heapHistory.length >= 3
            ? _heapHistory[_heapHistory.length - 1] - _heapHistory[0]
            : 0;

        _lastHeapMB = heapMB;

        // Threshold enforcement
        if (heapMB > HEAP_LIMIT_MB) {
            _emit('memory_pressure', `${Math.round(heapMB)}MB heap — limit ${HEAP_LIMIT_MB}MB`);
            _activateMitigation();
        } else if (heapMB > HEAP_LIMIT_MB * 0.85 && trend > 20) {
            // Heap approaching limit AND growing fast — preemptive mitigation
            _emit('memory_pressure_warning', `${Math.round(heapMB)}MB (+${Math.round(trend)}MB trend)`);
            _activateMitigation();
        } else if (_mitigationActive && heapMB < HEAP_LIMIT_MB * 0.7) {
            _deactivateMitigation();
        }
    }, HEAP_SAMPLE_INTERVAL);
}

function _activateMitigation() {
    if (_mitigationActive) return;
    _mitigationActive = true;
    // Signal all subscribers to reduce load
    window.dispatchEvent(new CustomEvent('neet:memory_pressure', { detail: { active: true } }));
}

function _deactivateMitigation() {
    _mitigationActive = false;
    window.dispatchEvent(new CustomEvent('neet:memory_pressure', { detail: { active: false } }));
}

// ── Hydration Timing (Route Render Blocking) ────────────────────────────────

function _attachHydrationTiming() {
    try {
        const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 2500) {
                    _emit('hydration_slow', `LCP ${Math.round(entry.startTime)}ms on ${window.location.pathname}`);
                }
            }
        });
        obs.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch { }
}

// ── Unhandled Rejections → Telemetry ───────────────────────────────────────

function _attachUnhandledRejectionCapture() {
    window.addEventListener('unhandledrejection', (e) => {
        const msg = e.reason?.message || String(e.reason);
        _emit('unhandled_rejection', msg.substring(0, 200));

        // Forward fatal errors to Flutter Crashlytics if bridge available
        if (window.NEET_REPORT_FATAL && msg.toLowerCase().includes('fatal')) {
            window.NEET_REPORT_FATAL({ message: msg, stack: e.reason?.stack });
        }
    });
}

// ── Telemetry ───────────────────────────────────────────────────────────────

function _emit(event_type, failure_reason = null) {
    import('@/lib/telemetry/mobile-buffer').then(m => {
        m.bufferEvent({
            event_type,
            failure_reason,
            route: window?.location?.pathname || 'unknown',
            device_info: {
                heapMB: performance.memory
                    ? Math.round(performance.memory.usedJSHeapSize / 1048576)
                    : null,
                mitigationActive: _mitigationActive
            }
        });
    }).catch(() => {});
}
