'use client';
/**
 * components/skeletons/index.js — Full Skeleton Loading System
 * Wave 7: Experience Hardening
 *
 * Rules:
 * - Shimmer animation only (no pulse — too distracting)
 * - Preserve exact future layout dimensions
 * - No layout shift when real content arrives
 * - Import via: import { DashboardSkeleton, ... } from '@/components/skeletons'
 */

import React from 'react';

/* ── Primitive ─────────────────────────────────────────────── */
function SkeletonBox({ width = '100%', height = 16, radius = 8, style = {} }) {
    return (
        <div style={{
            width,
            height,
            borderRadius: radius,
            background:   'var(--skeleton-base)',
            backgroundImage: 'linear-gradient(90deg, #1c2438 0%, #263045 50%, #1c2438 100%)',
            backgroundSize: '800px 100%',
            animation:    'shimmer 1.4s linear infinite',
            flexShrink:   0,
            ...style,
        }} aria-hidden="true" />
    );
}

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCardSkeleton() {
    return (
        <div style={{
            background:   'var(--surface-card)',
            borderRadius: 'var(--radius-md)',
            padding:      '16px',
            display:      'flex',
            flexDirection:'column',
            gap:          '10px',
        }}>
            <SkeletonBox width="40px" height="40px" radius={10} />
            <SkeletonBox width="60%" height={14} />
            <SkeletonBox width="40%" height={22} />
        </div>
    );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export function DashboardSkeleton() {
    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SkeletonBox width="160px" height={24} />
                    <SkeletonBox width="110px" height={14} />
                </div>
                <SkeletonBox width="40px" height="40px" radius={20} />
            </div>

            {/* Streak/XP bar */}
            <div style={{
                background:   'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding:      '16px',
                display:      'flex',
                gap:          '16px',
            }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <SkeletonBox height={28} />
                        <SkeletonBox width="70%" height={12} />
                    </div>
                ))}
            </div>

            {/* Stat cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
            </div>

            {/* Continue test block */}
            <div style={{
                background:   'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding:      '20px',
                display:      'flex',
                flexDirection:'column',
                gap:          '12px',
            }}>
                <SkeletonBox width="50%" height={18} />
                <SkeletonBox height={12} />
                <SkeletonBox width="80%" height={12} />
                <SkeletonBox height="44px" radius={12} style={{ marginTop: 4 }} />
            </div>
        </div>
    );
}

/* ── Leaderboard Row ───────────────────────────────────────── */
function LeaderboardRowSkeleton() {
    return (
        <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '12px',
            padding:     '12px 16px',
            background:  'var(--surface-card)',
            borderRadius:'var(--radius-md)',
        }}>
            <SkeletonBox width="28px" height={28} radius={6} />
            <SkeletonBox width="36px" height="36px" radius={18} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <SkeletonBox width="55%" height={14} />
                <SkeletonBox width="35%" height={11} />
            </div>
            <SkeletonBox width="48px" height={20} radius={6} />
        </div>
    );
}

export function LeaderboardSkeleton({ rows = 8 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
            <SkeletonBox width="140px" height={22} style={{ marginBottom: 8 }} />
            {Array.from({ length: rows }).map((_, i) => (
                <LeaderboardRowSkeleton key={i} />
            ))}
        </div>
    );
}

/* ── Test List ─────────────────────────────────────────────── */
function TestCardSkeleton() {
    return (
        <div style={{
            background:    'var(--surface-card)',
            borderRadius:  'var(--radius-md)',
            padding:       '16px',
            display:       'flex',
            flexDirection: 'column',
            gap:           '10px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <SkeletonBox width="45%" height={16} />
                <SkeletonBox width="60px" height={22} radius={20} />
            </div>
            <SkeletonBox width="80%" height={13} />
            <div style={{ display: 'flex', gap: '8px', marginTop: 4 }}>
                <SkeletonBox width="70px" height={11} />
                <SkeletonBox width="90px" height={11} />
                <SkeletonBox width="60px" height={11} />
            </div>
        </div>
    );
}

export function TestListSkeleton({ count = 5 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
            <SkeletonBox width="120px" height={22} style={{ marginBottom: 8 }} />
            {Array.from({ length: count }).map((_, i) => <TestCardSkeleton key={i} />)}
        </div>
    );
}

/* ── Mistake Card ──────────────────────────────────────────── */
function MistakeCardSkeleton() {
    return (
        <div style={{
            background:    'var(--surface-card)',
            borderRadius:  'var(--radius-md)',
            padding:       '16px',
            display:       'flex',
            flexDirection: 'column',
            gap:           '10px',
            borderLeft:    '3px solid var(--surface-elevated)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <SkeletonBox width="30%" height={12} radius={20} />
                <SkeletonBox width="50px" height={12} />
            </div>
            <SkeletonBox height={15} />
            <SkeletonBox width="85%" height={15} />
            <SkeletonBox width="60%" height={15} />
            <div style={{ display: 'flex', gap: '8px', marginTop: 4 }}>
                <SkeletonBox width="80px" height={30} radius={8} />
                <SkeletonBox width="100px" height={30} radius={8} />
            </div>
        </div>
    );
}

export function MistakeCardsSkeleton({ count = 4 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            {Array.from({ length: count }).map((_, i) => <MistakeCardSkeleton key={i} />)}
        </div>
    );
}

/* ── Analytics ─────────────────────────────────────────────── */
export function AnalyticsSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            {/* Chart block */}
            <div style={{
                background:   'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding:      '20px',
                display:      'flex',
                flexDirection:'column',
                gap:          '12px',
            }}>
                <SkeletonBox width="45%" height={18} />
                <SkeletonBox height="160px" radius={12} />
            </div>
            {/* Subject bars */}
            <div style={{
                background:   'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding:      '20px',
                display:      'flex',
                flexDirection:'column',
                gap:          '14px',
            }}>
                <SkeletonBox width="55%" height={18} />
                {['80%', '60%', '75%', '45%'].map((w, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <SkeletonBox width="90px" height={12} />
                            <SkeletonBox width="40px" height={12} />
                        </div>
                        <SkeletonBox width={w} height={8} radius={4} />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Profile ───────────────────────────────────────────────── */
export function ProfileSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
                <SkeletonBox width="80px" height="80px" radius={40} />
                <SkeletonBox width="140px" height={20} />
                <SkeletonBox width="100px" height={14} />
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px' }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{
                        flex: 1, background: 'var(--surface-card)',
                        borderRadius: 'var(--radius-md)', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center',
                    }}>
                        <SkeletonBox width="60%" height={22} />
                        <SkeletonBox width="80%" height={12} />
                    </div>
                ))}
            </div>
            {/* Settings list */}
            {[1,2,3,4].map(i => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', padding: '14px 16px',
                }}>
                    <SkeletonBox width="36px" height="36px" radius={10} />
                    <SkeletonBox width="55%" height={15} />
                    <SkeletonBox width="20px" height={15} style={{ marginLeft: 'auto' }} />
                </div>
            ))}
        </div>
    );
}
