'use client';
/**
 * components/ui/EmptyState.js — Premium Empty State System
 * Wave 7: Experience Hardening
 *
 * Every empty state must be:
 * - Motivational (not just informational)
 * - Visually complete (no dead space)
 * - Action-oriented (clear CTA)
 * - Context-aware (different copy per screen)
 *
 * Usage:
 *   <EmptyState type="mistakes" onAction={() => router.push('/test')} />
 *   <EmptyState type="custom" headline="..." body="..." ctaLabel="..." />
 */

import Link from 'next/link';
import { NotebookPen, Trophy, BookOpen, Target, Zap, BarChart2 } from 'lucide-react';

/* ── Empty State Configs ───────────────────────────────────── */
const EMPTY_CONFIGS = {
    mistakes: {
        Icon:      NotebookPen,
        color:     '#9b6dff',
        headline:  'Every topper built from mistakes.',
        body:      'Take your first test to unlock your mistake notebook. Your weak areas will appear here for focused revision.',
        ctaLabel:  'Start Your First Test',
        ctaHref:   '/test',
    },
    leaderboard: {
        Icon:      Trophy,
        color:     '#f59e0b',
        headline:  'Your rank is waiting.',
        body:      'Complete tests to appear on the leaderboard. Top performers get featured to their batch.',
        ctaLabel:  'Practice Now',
        ctaHref:   '/practice',
    },
    practice: {
        Icon:      BookOpen,
        color:     '#38bdf8',
        headline:  'No practice sessions yet.',
        body:      'Start your first practice session to build mastery. Consistent daily practice is the NEET difference.',
        ctaLabel:  'Start Practicing',
        ctaHref:   '/practice',
    },
    tests: {
        Icon:      Zap,
        color:     '#7c4dff',
        headline:  'No tests taken yet.',
        body:      'Full mock tests simulate real NEET conditions. Take your first test to benchmark your preparation.',
        ctaLabel:  'Take a Mock Test',
        ctaHref:   '/test',
    },
    analytics: {
        Icon:      BarChart2,
        color:     '#22c55e',
        headline:  'Your analytics will grow here.',
        body:      'After 3 tests, your subject-wise accuracy, speed trends, and weak areas will populate this dashboard.',
        ctaLabel:  'Take a Test',
        ctaHref:   '/test',
    },
    results: {
        Icon:      Target,
        color:     '#ef4444',
        headline:  'No results found.',
        body:      'Try adjusting your filters or check back after completing more tests.',
        ctaLabel:  null,
        ctaHref:   null,
    },
};

/* ── Ghost Preview Card (shows future layout) ──────────────── */
function GhostCard({ width = '100%', lines = 3 }) {
    return (
        <div style={{
            background:    'var(--surface-card)',
            borderRadius:  'var(--radius-md)',
            padding:       '14px',
            opacity:       0.35,
            display:       'flex',
            flexDirection: 'column',
            gap:           '8px',
            border:        '1px dashed var(--border-subtle)',
        }}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} style={{
                    height:       12,
                    borderRadius: 6,
                    background:   'var(--surface-hover)',
                    width:        i === 0 ? '65%' : i === lines - 1 ? '40%' : '85%',
                }} />
            ))}
        </div>
    );
}

/* ── Main Component ────────────────────────────────────────── */
export function EmptyState({
    type,
    headline,
    body,
    ctaLabel,
    ctaHref,
    onAction,
    showGhostCards = true,
    icon: CustomIcon,
    iconColor,
}) {
    const config  = type ? EMPTY_CONFIGS[type] : null;
    const Icon    = CustomIcon || (config?.Icon) || Target;
    const color   = iconColor || config?.color || 'var(--accent-primary)';
    const title   = headline || config?.headline || 'Nothing here yet.';
    const desc    = body     || config?.body     || '';
    const label   = ctaLabel !== undefined ? ctaLabel : config?.ctaLabel;
    const href    = ctaHref  !== undefined ? ctaHref  : config?.ctaHref;

    return (
        <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            padding:        '32px 24px 24px',
            gap:            '0',
        }}>
            {/* Icon ring */}
            <div style={{
                width:           72,
                height:          72,
                borderRadius:    '50%',
                background:      `radial-gradient(circle, ${color}22 0%, ${color}08 100%)`,
                border:          `1.5px solid ${color}33`,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                marginBottom:    '20px',
            }}>
                <Icon size={32} style={{ color }} strokeWidth={1.5} aria-hidden="true" />
            </div>

            {/* Headline */}
            <h2 style={{
                fontSize:     '18px',
                fontWeight:   700,
                color:        'var(--text-primary)',
                textAlign:    'center',
                margin:       '0 0 10px',
                lineHeight:   1.3,
            }}>
                {title}
            </h2>

            {/* Body copy */}
            <p style={{
                fontSize:   '14px',
                color:      'var(--text-secondary)',
                textAlign:  'center',
                lineHeight: 1.6,
                margin:     '0 0 24px',
                maxWidth:   '300px',
            }}>
                {desc}
            </p>

            {/* CTA */}
            {label && (
                href ? (
                    <Link
                        href={href}
                        style={{
                            display:        'inline-flex',
                            alignItems:     'center',
                            gap:            '6px',
                            padding:        '13px 28px',
                            borderRadius:   'var(--radius-full)',
                            background:     'var(--accent-gradient)',
                            color:          '#fff',
                            fontWeight:     600,
                            fontSize:       '15px',
                            textDecoration: 'none',
                            boxShadow:      'var(--shadow-accent)',
                            transition:     'transform 120ms cubic-bezier(0.34,1.56,0.64,1)',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {label} →
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        style={{
                            display:     'inline-flex',
                            alignItems:  'center',
                            gap:         '6px',
                            padding:     '13px 28px',
                            borderRadius:'var(--radius-full)',
                            background:  'var(--accent-gradient)',
                            color:       '#fff',
                            fontWeight:  600,
                            fontSize:    '15px',
                            border:      'none',
                            cursor:      'pointer',
                            boxShadow:   'var(--shadow-accent)',
                        }}
                    >
                        {label} →
                    </button>
                )
            )}

            {/* Ghost preview cards — show future layout */}
            {showGhostCards && (
                <div style={{
                    width:          '100%',
                    marginTop:      '28px',
                    display:        'flex',
                    flexDirection:  'column',
                    gap:            '8px',
                    pointerEvents:  'none',
                }}>
                    <GhostCard lines={3} />
                    <GhostCard lines={2} />
                </div>
            )}
        </div>
    );
}
