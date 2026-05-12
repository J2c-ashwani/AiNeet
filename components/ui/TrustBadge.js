'use client';
/**
 * components/ui/TrustBadge.js — Visual Trust Layer
 * Wave 7: Experience Hardening
 *
 * Surfaces engineering reliability signals in the UI.
 * These small signals communicate the seriousness of the platform.
 *
 * Types:
 *  - autosaved      "Autosaved 12s ago"
 *  - recovered      "Session recovered"
 *  - ai-confidence  "AI confidence: 94%"
 *  - verified-pyq   "Verified PYQ"
 *  - teacher        "Teacher-reviewed"
 *  - server-time    "Server-verified timing"
 */

import { Shield, Clock, Brain, CheckCircle, GraduationCap, TimerReset } from 'lucide-react';

const BADGE_CONFIGS = {
    'autosaved': {
        Icon:  Clock,
        color: '#22c55e',
        bg:    'rgba(34,197,94,0.10)',
        label: (meta) => `Autosaved ${meta?.seconds || ''}${meta?.seconds ? 's ago' : 'just now'}`,
    },
    'recovered': {
        Icon:  CheckCircle,
        color: '#22c55e',
        bg:    'rgba(34,197,94,0.10)',
        label: () => 'Session recovered',
    },
    'ai-confidence': {
        Icon:  Brain,
        color: '#9b6dff',
        bg:    'rgba(124,77,255,0.10)',
        label: (meta) => `AI confidence: ${meta?.pct || '—'}%`,
    },
    'verified-pyq': {
        Icon:  Shield,
        color: '#38bdf8',
        bg:    'rgba(56,189,248,0.10)',
        label: () => 'Verified PYQ',
    },
    'teacher': {
        Icon:  GraduationCap,
        color: '#f59e0b',
        bg:    'rgba(245,158,11,0.10)',
        label: () => 'Teacher-reviewed',
    },
    'server-time': {
        Icon:  TimerReset,
        color: '#7d879c',
        bg:    'rgba(125,135,156,0.10)',
        label: () => 'Server-verified timing',
    },
};

export function TrustBadge({ type, meta = {}, className = '' }) {
    const cfg = BADGE_CONFIGS[type];
    if (!cfg) return null;

    const { Icon, color, bg, label } = cfg;

    return (
        <div
            className={className}
            role="status"
            aria-label={label(meta)}
            style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '5px',
                padding:      '4px 10px',
                borderRadius: 'var(--radius-full)',
                background:   bg,
                border:       `1px solid ${color}33`,
            }}
        >
            <Icon size={11} style={{ color }} strokeWidth={2.5} aria-hidden="true" />
            <span style={{
                fontSize:   '11px',
                fontWeight:  600,
                color,
                letterSpacing: '0.01em',
                lineHeight: 1,
            }}>
                {label(meta)}
            </span>
        </div>
    );
}

/**
 * AutosaveIndicator — mounts during active tests, updates every 20s
 */
export function AutosaveIndicator({ lastSavedAt }) {
    if (!lastSavedAt) return null;

    const secondsAgo = Math.round((Date.now() - lastSavedAt) / 1000);
    const display    = secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`;

    return (
        <TrustBadge
            type="autosaved"
            meta={{ seconds: secondsAgo < 5 ? null : secondsAgo }}
        />
    );
}
