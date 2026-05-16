'use client';
/**
 * components/ui/NCERTBadge.js — Trust Badge (MD Modification 10)
 * Visible "NCERT Grounded" badge displayed on every explanation.
 * Only shown when similarity >= 0.72 and citations are attached.
 */
import { Icon } from '@/components/ui/Icon';

const TIER_STYLES = {
    gold:   { color: 'var(--warning)',  bg: 'rgba(245, 158, 11, 0.12)',  border: 'rgba(245, 158, 11, 0.3)',  icon: 'Shield' },
    silver: { color: 'var(--info)',     bg: 'rgba(59, 130, 246, 0.12)',  border: 'rgba(59, 130, 246, 0.3)',  icon: 'CheckCircle' },
    bronze: { color: 'var(--success)',  bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', icon: 'BookOpen' },
    none:   { color: 'var(--text-muted)', bg: 'var(--bg-glass)', border: 'var(--border-color)', icon: 'HelpCircle' },
};

export function NCERTBadge({ trustBadge, showDetails = false }) {
    if (!trustBadge || !trustBadge.show) return null;

    const style = TIER_STYLES[trustBadge.tier] || TIER_STYLES.bronze;

    return (
        <div
            title={`Retrieved from: ${trustBadge.chapterTitle || 'NCERT'} — ${trustBadge.similarity}% match`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 'var(--radius-full)',
                color: style.color,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: showDetails ? 'pointer' : 'default',
                userSelect: 'none',
            }}
        >
            <Icon name={style.icon} size={13} color={style.color} />
            <span>{trustBadge.label}</span>
            <span style={{ opacity: 0.75, fontWeight: 500 }}>
                {trustBadge.similarity}%
            </span>
        </div>
    );
}

/** Expanded source citation panel shown in admin review */
export function NCERTSourcePanel({ sourceChunks = [], chapterTitle, ncertBadge }) {
    if (!sourceChunks.length) return null;

    return (
        <div style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon name="BookOpen" size={16} color="var(--accent-primary)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    NCERT Source Citations
                </span>
                {ncertBadge && <NCERTBadge trustBadge={ncertBadge} />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sourceChunks.map((chunk, i) => (
                    <div key={chunk.id || i} style={{
                        padding: '10px 12px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                {chunk.chapterTitle || chapterTitle}
                                {chunk.topicSlug && ` > ${chunk.topicSlug}`}
                            </span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {Math.round((chunk.similarity || 0) * 100)}% match
                                </span>
                                {chunk.sourceUrl && (
                                    <a
                                        href={chunk.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--accent-primary)', fontSize: '0.7rem' }}
                                    >
                                        <Icon name="ArrowRight" size={12} /> ncert.nic.in
                                    </a>
                                )}
                            </div>
                        </div>
                        <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            margin: 0,
                            maxHeight: 80,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {chunk.chunkText?.substring(0, 250)}...
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
