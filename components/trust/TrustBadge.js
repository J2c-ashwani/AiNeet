'use client';
/**
 * components/trust/TrustBadge.js — Visual Trust Layer
 * Wave 7: Final Architecture
 *
 * Surfaces governed engineering reliability signals in the UI.
 * Never uses flashy colors or bouncing animations.
 */

import { Shield, Clock, Brain, CheckCircle, GraduationCap, TimerReset, AlertTriangle } from 'lucide-react';
import { TRUST_LEVELS, getAIConfidenceBand } from '@/lib/trust/config';

const ICONS = {
    'ai-high': Brain,
    'ai-moderate': Brain,
    'ai-low': AlertTriangle,
    'verified-pyq': Shield,
    'recovery-success': CheckCircle,
    'teacher-reviewed': GraduationCap,
    'autosave': Clock
};

export function TrustBadge({ type, meta = {}, className = '' }) {
    let cfg = Object.values(TRUST_LEVELS).find(t => t.id === type) || (type === 'autosaved' ? TRUST_LEVELS.AUTOSAVE : null);
    
    // Auto-map AI scores to bands if requested
    if (type === 'ai-confidence') {
        cfg = getAIConfidenceBand(meta.pct ? (meta.pct / 100) : (meta.score || 0));
    }

    if (!cfg) return null;

    const Icon = ICONS[cfg.id] || CheckCircle;

    return (
        <div
            className={className}
            role="status"
            aria-label={cfg.label}
            style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '5px',
                padding:      '4px 10px',
                borderRadius: 'var(--radius-full)',
                background:   cfg.bg,
                border:       `1px solid ${cfg.color}33`,
            }}
        >
            <Icon size={11} style={{ color: cfg.color }} strokeWidth={2.5} aria-hidden="true" />
            <span style={{
                fontSize:   '11px',
                fontWeight:  600,
                color: cfg.color,
                letterSpacing: '0.01em',
                lineHeight: 1,
            }}>
                {type === 'autosaved' && meta.seconds 
                    ? `Autosaved ${meta.seconds}s ago` 
                    : cfg.label}
            </span>
        </div>
    );
}

/**
 * AutosaveIndicator — passive indicator for active tests/drafts
 */
export function AutosaveIndicator({ lastSavedAt }) {
    if (!lastSavedAt) return null;

    const secondsAgo = Math.round((Date.now() - lastSavedAt) / 1000);
    if (secondsAgo < 5) {
        return <TrustBadge type="autosave" />;
    }

    return (
        <TrustBadge
            type="autosaved"
            meta={{ seconds: secondsAgo }}
        />
    );
}
