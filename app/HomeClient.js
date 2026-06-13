'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { resilientStorage, STORAGE_KEYS } from '@/lib/storage-resilient';
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
    const labels = { custom: 'Custom', adaptive: 'Adaptive', ai_generated: 'AI Generated', mock: 'Full Mock', pyq: 'PYQ', yearly_pyq: 'PYQ' };
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
        <div className="page" style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Hey {firstName} <Icon name="Smile" /></h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Ready to crush your goals today?</p>
                </div>
                <div>
                    <Badge variant={streak > 0 ? 'warning' : 'neutral'}>
                        {streak > 0 ? <><Icon name="Flame" size={14} /> {streak}-Day Streak</> : 'Start a streak!'}
                    </Badge>
                </div>
            </div>

            {/* NEET Countdown Section */}
            <Card style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>NEET 2027 Countdown</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{daysLeft} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>days left</span></div>
                </div>
                <div className="progress-bar" style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${yearProgress}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Prep Started</span>
                    <span>{yearProgress}% of year complete</span>
                </div>
            </Card>

            {/* Quick Stats Grid */}
            {!isNewUser && (
                <div className="grid grid-3" style={{ gap: 16, marginBottom: 24 }}>
                    {statsLoading ? (
                        <>
                            <Skeleton style={{ height: 110 }} />
                            <Skeleton style={{ height: 110 }} />
                            <Skeleton style={{ height: 110 }} />
                        </>
                    ) : (
                        <>
                            <div className="stat-card" style={{ padding: 16, textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.total_tests || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tests Taken</div>
                            </div>
                            <div className="stat-card" style={{ padding: 16, textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.avg_accuracy || 0}%</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Accuracy</div>
                            </div>
                            <div className="stat-card" style={{ padding: 16, textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.questions_solved || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Qs Solved</div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Primary Action */}
            <Link href="/test/configure?type=adaptive" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
                <Card interactive style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Start Daily Practice</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>AI will select questions based on your weak areas.</p>
                    </div>
                    <div style={{ fontSize: '2rem' }}><Icon name="Zap" /></div>
                </Card>
            </Link>

            {/* New User Onboarding */}
            {isNewUser && (
                <Card style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}><Icon name="Target" /></div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px' }}>Take your first diagnostic test</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                        Complete one test to unlock your personal dashboard with AI-powered weak topic analysis.
                    </p>
                    <Link href="/test/configure">
                        <Button variant="success" size="lg">Generate First Test</Button>
                    </Link>
                </Card>
            )}

            {/* Weak Topic Nudge */}
            {!statsLoading && stats?.weakest && (
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Focus Required</h3>
                    <Link href="/test/configure" style={{ textDecoration: 'none' }}>
                        <Card interactive style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>
                                <Icon name="AlertCircle" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your weakest area</div>
                                <div style={{ fontWeight: 700 }}>{stats.weakest.chapter} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({stats.weakest.accuracy}% accuracy)</span></div>
                            </div>
                            <Button variant="danger" size="sm" style={{ pointerEvents: 'none' }}>Fix Now</Button>
                        </Card>
                    </Link>
                </div>
            )}

            {/* Recent Tests */}
            {!statsLoading && stats?.recent_tests?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Recent Tests</h3>
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                        {stats.recent_tests.map(test => (
                            <Link key={test.id} href={`/test/${test.id}/results`} style={{ textDecoration: 'none', flexShrink: 0, width: 200 }}>
                                <Card interactive style={{ padding: 16 }}>
                                    <Badge variant="info" style={{ marginBottom: 12 }}>{testTypeLabel(test.type)}</Badge>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{test.score}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/{test.total_marks}</span></div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{timeAgo(test.completed_at)}</div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Tools Grid */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Quick Tools</h3>
                <div className="grid grid-2" style={{ gap: 16 }}>
                    {[
                        { icon: <Icon name="MessageCircle" size={20} />, label: 'Ask Doubt', desc: 'AI instant help', path: '/doubts', variant: 'success' },
                        { icon: <Icon name="Camera" size={20} />, label: 'OMR Scan', desc: 'Scan answer sheet', path: '/omr', variant: 'info' },
                        { icon: <Icon name="BookMarked" size={20} />, label: 'Mistakes', desc: 'Review wrong Qs', path: '/mistakes', variant: 'warning' },
                        { icon: <Icon name="BookOpen" size={20} />, label: 'NCERT', desc: 'Chapter reading', path: '/ncert', variant: 'neet' },
                    ].map(action => (
                        <Link key={action.path} href={action.path} style={{ textDecoration: 'none' }}>
                            <Card interactive style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <Badge variant={action.variant} style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{action.icon}</Badge>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{action.label}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{action.desc}</div>
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
        <div className="page" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {/* Hero Section */}
            <div style={{ marginBottom: 48 }}>
                <Badge variant="warning" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="Target" size={14} /> Smart Diagnostic Test
                </Badge>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
                    Are you scoring below 600 in mock tests?
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 32px' }}>
                    Don't guess what's wrong. Take our 10-minute AI diagnostic test to find the exact chapter destroying your NEET score.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <Link href="/test/diagnostic">
                        <Button size="lg" variant="primary">Find My Weakest Chapter →</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="lg" variant="secondary">Create Free Account</Button>
                    </Link>
                </div>
            </div>

            {/* Social Proof */}
            <div className="grid grid-3" style={{ gap: 16, marginBottom: 48 }}>
                {[
                    { value: '12,400+', label: 'Tests Generated', icon: <Icon name="FileText" size={28} color="#6366f1" /> },
                    { value: 'Gemini AI', label: 'Powered By Google', icon: <Icon name="Brain" size={28} color="#a855f7" /> },
                    { value: '4.6 ★', label: 'Play Store Rating', icon: <Icon name="Star" size={28} color="#eab308" /> },
                ].map((item, i) => (
                    <Card key={i} style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{item.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{item.value}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.label}</div>
                    </Card>
                ))}
            </div>

            {/* Feature Preview */}
            <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 32 }}>
                    Everything you need to secure your rank.
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {[
                        { icon: <Icon name="FileText" size={28} color="#6366f1" />, title: 'Infinite AI Mock Tests', desc: 'Custom, adaptive, PYQ — all test types generated instantly.' },
                        { icon: <Icon name="MessageCircle" size={28} color="#10b981" />, title: '24/7 AI Doubt Solver', desc: 'Step-by-step NEET explanations tailored to your level.' },
                        { icon: <Icon name="BarChart2" size={28} color="#f43f5e" />, title: 'Performance Analytics', desc: 'Weak topics, accuracy trends, and rank prediction models.' },
                        { icon: <Icon name="Camera" size={28} color="#3b82f6" />, title: 'OMR Scanner', desc: 'Scan physical mock tests with your mobile camera instantly.' },
                    ].map((f, i) => (
                        <Card key={i} style={{ padding: 24, display: 'flex', gap: 16, textAlign: 'left' }}>
                            <div style={{ flexShrink: 0 }}>{f.icon}</div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* App Download CTA */}
            <Card style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 0 8px' }}><Icon name="Star" size={16} /> Study seamlessly on mobile</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
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
export default function HomeClient() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState(null);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        if (typeof window !== 'undefined') {
            resilientStorage.get(STORAGE_KEYS.ONBOARDING_COMPLETE).then(val => setIsOnboarded(val === 'true'));
        }
    }, []);

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

    if (!hasMounted) return null; // Prevent hydration mismatch

    if (authLoading) {
        return (
            <div className="page" style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Header skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Skeleton style={{ width: 220, height: 32, marginBottom: 8 }} />
                        <Skeleton style={{ width: 180, height: 18 }} />
                    </div>
                    <Skeleton style={{ width: 120, height: 28 }} />
                </div>

                {/* Countdown card skeleton */}
                <Skeleton style={{ height: 120, marginBottom: 24 }} />

                {/* Stats grid skeleton */}
                <div className="grid grid-3" style={{ gap: 16, marginBottom: 24 }}>
                    <Skeleton style={{ height: 90 }} />
                    <Skeleton style={{ height: 90 }} />
                    <Skeleton style={{ height: 90 }} />
                </div>

                {/* CTA skeleton */}
                <Skeleton style={{ height: 80, marginBottom: 24 }} />

                {/* Quick tools skeleton */}
                <Skeleton style={{ width: 100, height: 16, marginBottom: 16 }} />
                <div className="grid grid-2" style={{ gap: 16 }}>
                    <Skeleton style={{ height: 80 }} />
                    <Skeleton style={{ height: 80 }} />
                    <Skeleton style={{ height: 80 }} />
                    <Skeleton style={{ height: 80 }} />
                </div>
            </div>
        );
    }

    if (user) {
        // Redirect new users to onboarding if they haven't completed it
        if (!statsLoading && (!stats || stats.total_tests === 0)) {
            if (isOnboarded === false) {
                window.location.href = '/welcome';
                return null;
            }
        }
        return <CoachingHome user={user} stats={stats} statsLoading={statsLoading} />;
    }

    return <GuestLanding />;
}
