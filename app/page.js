'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Skeleton } from '@/components/ui';

// NEET 2027 Exam Date
const NEET_DATE = new Date('2027-05-02T00:00:00+05:30');

function getDaysUntilNEET() {
    const now = new Date();
    const diff = NEET_DATE - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getYearProgress() {
    const start = new Date('2025-06-01');
    const end = NEET_DATE;
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

function testTypeLabel(type) {
    const labels = { custom: 'Custom', adaptive: 'Adaptive', ai_generated: 'AI Gen', mock: 'Full Mock', pyq: 'PYQ', yearly_pyq: 'PYQ' };
    return labels[type] || type;
}

// ─── Logged-In Home Screen ───
function CoachingHome({ user, stats, statsLoading }) {
    const daysLeft = getDaysUntilNEET();
    const yearProgress = getYearProgress();
    const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Aspirant';
    const streak = user?.streak || 0;
    const isNewUser = !statsLoading && (!stats || stats.total_tests === 0);

    return (
        <div className="page" style={{ maxWidth: '680px', paddingTop: '24px' }}>
            
            {/* Header Area */}
            <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2.2rem' }}>Hey {firstName} 👋</h1>
                    <p className="page-subtitle" style={{ fontSize: '1rem', marginTop: '4px' }}>Ready to crush your goals today?</p>
                </div>
                <div>
                    <Badge variant={streak > 0 ? 'warning' : 'neutral'} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                        {streak > 0 ? `🔥 ${streak}-Day Streak` : 'Start a streak!'}
                    </Badge>
                </div>
            </div>

            {/* NEET Countdown Section */}
            <Card style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>NEET 2027 Countdown</h3>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{daysLeft} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>days left</span></div>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${yearProgress}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Prep Started</span>
                    <span>{yearProgress}% of year complete</span>
                </div>
            </Card>

            {/* Quick Stats Grid */}
            {!isNewUser && (
                <div className="grid grid-3" style={{ marginBottom: '40px' }}>
                    {statsLoading ? (
                        <>
                            <Skeleton style={{ height: '110px' }} />
                            <Skeleton style={{ height: '110px' }} />
                            <Skeleton style={{ height: '110px' }} />
                        </>
                    ) : (
                        <>
                            <div className="stat-card">
                                <div className="stat-value">{stats?.total_tests || 0}</div>
                                <div className="stat-label">Tests Taken</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats?.avg_accuracy || 0}%</div>
                                <div className="stat-label">Accuracy</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats?.questions_solved || 0}</div>
                                <div className="stat-label">Qs Solved</div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Primary Action (Academic & Focused) */}
            <Link href="/test/configure?type=adaptive" style={{ textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
                <Card interactive className="flex items-center justify-between" style={{ background: 'var(--bg-glass-hover)', padding: '24px 32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>Start Daily Practice</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>AI will select questions based on your weak areas.</p>
                    </div>
                    <div style={{ fontSize: '1.8rem' }}>⚡</div>
                </Card>
            </Link>

            {/* New User Onboarding */}
            {isNewUser && (
                <Card style={{ marginBottom: '40px', textAlign: 'center', padding: '40px 24px', border: '1px solid var(--success)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>Take your first diagnostic test</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                        Complete one test to unlock your personal dashboard with AI-powered weak topic analysis.
                    </p>
                    <Link href="/test/configure">
                        <Button variant="success" size="lg">Generate First Test</Button>
                    </Link>
                </Card>
            )}

            {/* Weak Topic Nudge */}
            {!statsLoading && stats?.weakest && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Focus Required</h3>
                    <Link href="/test/configure" style={{ textDecoration: 'none' }}>
                        <Card interactive style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                                ⚠️
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Your weakest area</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.weakest.chapter} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({stats.weakest.accuracy}% accuracy)</span></div>
                            </div>
                            <Button variant="danger" size="sm" style={{ pointerEvents: 'none' }}>Fix Now</Button>
                        </Card>
                    </Link>
                </div>
            )}

            {/* Recent Tests */}
            {!statsLoading && stats?.recent_tests?.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Recent Tests</h3>
                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {stats.recent_tests.map(test => (
                            <Link key={test.id} href={`/test/${test.id}/results`} style={{ textDecoration: 'none' }}>
                                <Card interactive style={{ minWidth: '160px', padding: '20px' }}>
                                    <Badge variant="info" style={{ marginBottom: '12px' }}>{testTypeLabel(test.type)}</Badge>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{test.score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/{test.total_marks}</span></div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{timeAgo(test.completed_at)}</div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Tools Grid */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Quick Tools</h3>
                <div className="grid grid-2">
                    {[
                        { icon: '💬', label: 'Ask Doubt', desc: 'AI instant help', path: '/doubts', variant: 'success' },
                        { icon: '📸', label: 'OMR Scan', desc: 'Scan answer sheet', path: '/omr', variant: 'info' },
                        { icon: '📓', label: 'Mistakes', desc: 'Review wrong Qs', path: '/mistakes', variant: 'warning' },
                        { icon: '📚', label: 'NCERT', desc: 'Chapter reading', path: '/ncert', variant: 'neet' },
                    ].map(action => (
                        <Link key={action.path} href={action.path} style={{ textDecoration: 'none' }}>
                            <Card interactive style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
                                <Badge variant={action.variant} style={{ width: 'fit-content', padding: '8px', fontSize: '1.2rem' }}>{action.icon}</Badge>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{action.label}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{action.desc}</div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Guest Landing Page ───
function GuestLanding() {
    return (
        <div className="page" style={{ maxWidth: '800px', textAlign: 'center' }}>
            {/* Hero Section */}
            <div style={{ padding: '60px 0 80px' }}>
                <Badge variant="danger" style={{ marginBottom: '24px', fontSize: '0.9rem', padding: '6px 16px' }}>
                    NEW: AI DIAGNOSTIC ENGINE
                </Badge>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                    Are you scoring below 600 in mock tests?
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                    Don't guess what's wrong. Take our 10-minute AI diagnostic test to find the exact chapter destroying your NEET score.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/test/diagnostic">
                        <Button size="lg" variant="primary">Find My Weakest Chapter →</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="lg" variant="secondary">Create Free Account</Button>
                    </Link>
                </div>
            </div>

            {/* Social Proof */}
            <div className="grid grid-3" style={{ marginBottom: '80px' }}>
                {[
                    { value: '12,400+', label: 'Tests Generated', icon: '📝' },
                    { value: 'Gemini AI', label: 'Powered By Google', icon: '🧠' },
                    { value: '4.6 ★', label: 'Play Store Rating', icon: '⭐' },
                ].map((item, i) => (
                    <Card key={i} style={{ padding: '24px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.value}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                    </Card>
                ))}
            </div>

            {/* Feature Preview */}
            <div style={{ textAlign: 'left', marginBottom: '80px', maxWidth: '600px', margin: '0 auto 80px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px', textAlign: 'center' }}>
                    Everything you need to secure your rank.
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { icon: '📝', title: 'Infinite AI Mock Tests', desc: 'Custom, adaptive, PYQ — all test types generated instantly.' },
                        { icon: '💬', title: '24/7 AI Doubt Solver', desc: 'Step-by-step NEET explanations tailored to your level.' },
                        { icon: '📊', title: 'Performance Analytics', desc: 'Weak topics, accuracy trends, and rank prediction models.' },
                        { icon: '📸', title: 'OMR Scanner', desc: 'Scan physical mock tests with your mobile camera instantly.' },
                    ].map((f, i) => (
                        <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                            <div style={{ fontSize: '2rem', flexShrink: 0, opacity: 0.9 }}>{f.icon}</div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* App Download CTA */}
            <Card style={{ background: 'var(--bg-secondary)', padding: '48px', border: '1px solid var(--border-glow)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>📱 Study seamlessly on mobile</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto 32px' }}>
                    Download the Android app for offline mode, camera OMR scanning, and daily push notification streaks.
                </p>
                <Link href="/download">
                    <Button variant="success" size="lg">Download Free App →</Button>
                </Link>
            </Card>
        </div>
    );
}

// ─── Main Home Component ───
export default function Home() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setStatsLoading(false); return; }

        fetch('/api/home/stats')
            .then(r => r.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .catch(() => {})
            .finally(() => setStatsLoading(false));
    }, [user, authLoading]);

    if (authLoading) {
        return (
            <div className="page" style={{ maxWidth: '680px', paddingTop: '24px' }}>
                {/* Header skeleton */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Skeleton style={{ width: '220px', height: '32px', marginBottom: '8px' }} />
                        <Skeleton style={{ width: '180px', height: '18px' }} />
                    </div>
                    <Skeleton style={{ width: '120px', height: '28px', borderRadius: '999px' }} />
                </div>

                {/* Countdown card skeleton */}
                <Skeleton style={{ height: '120px', marginBottom: '32px', borderRadius: 'var(--radius-lg)' }} />

                {/* Stats grid skeleton */}
                <div className="grid grid-3" style={{ marginBottom: '40px' }}>
                    <Skeleton style={{ height: '90px' }} />
                    <Skeleton style={{ height: '90px' }} />
                    <Skeleton style={{ height: '90px' }} />
                </div>

                {/* CTA skeleton */}
                <Skeleton style={{ height: '80px', marginBottom: '40px', borderRadius: 'var(--radius-lg)' }} />

                {/* Quick tools skeleton */}
                <Skeleton style={{ width: '100px', height: '16px', marginBottom: '16px' }} />
                <div className="grid grid-2">
                    <Skeleton style={{ height: '100px' }} />
                    <Skeleton style={{ height: '100px' }} />
                    <Skeleton style={{ height: '100px' }} />
                    <Skeleton style={{ height: '100px' }} />
                </div>
            </div>
        );
    }

    if (user) {
        // Redirect new users to onboarding if they haven't completed it
        if (!statsLoading && (!stats || stats.total_tests === 0)) {
            if (typeof window !== 'undefined' && localStorage.getItem('onboarding_complete') !== 'true') {
                window.location.href = '/welcome';
                return null;
            }
        }
        return <CoachingHome user={user} stats={stats} statsLoading={statsLoading} />;
    }

    return <GuestLanding />;
}
