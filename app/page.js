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
        <div className="page landing-wrapper">
            
            {/* Header Area */}
            <div className="landing-header">
                <div>
                    <h1 className="landing-title">Hey {firstName} <Icon name="Smile" /></h1>
                    <p className="landing-subtitle">Ready to crush your goals today?</p>
                </div>
                <div>
                    <Badge variant={streak > 0 ? 'warning' : 'neutral'} className="landing-streak-badge">
                        {streak > 0 ? <><Icon name="Flame" size={14} /> {streak}-Day Streak</> : 'Start a streak!'}
                    </Badge>
                </div>
            </div>

            {/* NEET Countdown Section */}
            <Card className="landing-countdown-card">
                <div className="landing-countdown-header">
                    <h3 className="landing-countdown-title">NEET 2027 Countdown</h3>
                    <div className="landing-countdown-val">{daysLeft} <span className="landing-countdown-unit">days left</span></div>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${yearProgress}%` }}></div>
                </div>
                <div className="landing-countdown-meta">
                    <span>Prep Started</span>
                    <span>{yearProgress}% of year complete</span>
                </div>
            </Card>

            {/* Quick Stats Grid */}
            {!isNewUser && (
                <div className="grid grid-3 landing-stats-grid">
                    {statsLoading ? (
                        <>
                            <Skeleton style={{ height: 110 }} />
                            <Skeleton style={{ height: 110 }} />
                            <Skeleton style={{ height: 110 }} />
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
            <Link href="/test/configure?type=adaptive" style={{ textDecoration: 'none', display: 'block' }}>
                <Card interactive className="flex items-center justify-between landing-cta-card">
                    <div>
                        <h2 className="landing-cta-title">Start Daily Practice</h2>
                        <p className="landing-cta-desc">AI will select questions based on your weak areas.</p>
                    </div>
                    <div className="landing-cta-icon"><Icon name="Zap" /></div>
                </Card>
            </Link>

            {/* New User Onboarding */}
            {isNewUser && (
                <Card className="landing-onboard-card">
                    <div className="landing-onboard-icon"><Icon name="Target" /></div>
                    <h2 className="landing-onboard-title">Take your first diagnostic test</h2>
                    <p className="landing-onboard-desc">
                        Complete one test to unlock your personal dashboard with AI-powered weak topic analysis.
                    </p>
                    <Link href="/test/configure">
                        <Button variant="success" size="lg">Generate First Test</Button>
                    </Link>
                </Card>
            )}

            {/* Weak Topic Nudge */}
            {!statsLoading && stats?.weakest && (
                <div style={{ marginBottom: 40 }}>
                    <h3 className="landing-section-title">Focus Required</h3>
                    <Link href="/test/configure" style={{ textDecoration: 'none' }}>
                        <Card interactive className="landing-weak-card">
                            <div className="landing-weak-icon">
                                <Icon name="AlertCircle" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="landing-weak-label">Your weakest area</div>
                                <div className="landing-weak-val">{stats.weakest.chapter} <span className="landing-weak-meta">({stats.weakest.accuracy}% accuracy)</span></div>
                            </div>
                            <Button variant="danger" size="sm" style={{ pointerEvents: 'none' }}>Fix Now</Button>
                        </Card>
                    </Link>
                </div>
            )}

            {/* Recent Tests */}
            {!statsLoading && stats?.recent_tests?.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                    <h3 className="landing-section-title">Recent Tests</h3>
                    <div className="landing-recent-scroll">
                        {stats.recent_tests.map(test => (
                            <Link key={test.id} href={`/test/${test.id}/results`} style={{ textDecoration: 'none' }}>
                                <Card interactive className="landing-recent-card">
                                    <Badge variant="info" className="landing-recent-badge">{testTypeLabel(test.type)}</Badge>
                                    <div className="landing-recent-score">{test.score}<span className="landing-recent-total">/{test.total_marks}</span></div>
                                    <div className="landing-recent-time">{timeAgo(test.completed_at)}</div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Tools Grid */}
            <div style={{ marginBottom: 40 }}>
                <h3 className="landing-section-title">Quick Tools</h3>
                <div className="grid grid-2 landing-tools-grid">
                    {[
                        { icon: <Icon name="MessageCircle" size={20} />, label: 'Ask Doubt', desc: 'AI instant help', path: '/doubts', variant: 'success' },
                        { icon: <Icon name="Camera" size={20} />, label: 'OMR Scan', desc: 'Scan answer sheet', path: '/omr', variant: 'info' },
                        { icon: <Icon name="BookMarked" size={20} />, label: 'Mistakes', desc: 'Review wrong Qs', path: '/mistakes', variant: 'warning' },
                        { icon: <Icon name="BookOpen" size={20} />, label: 'NCERT', desc: 'Chapter reading', path: '/ncert', variant: 'neet' },
                    ].map(action => (
                        <Link key={action.path} href={action.path} style={{ textDecoration: 'none' }}>
                            <Card interactive className="landing-tool-card">
                                <Badge variant={action.variant} className="landing-tool-badge">{action.icon}</Badge>
                                <div>
                                    <div className="landing-tool-label">{action.label}</div>
                                    <div className="landing-tool-desc">{action.desc}</div>
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
        <div className="page guest-wrapper">
            {/* Hero Section */}
            <div className="guest-hero">
                <Badge variant="warning" className="guest-hero-badge" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="Target" size={14} /> Smart Diagnostic Test
                </Badge>
                <h1 className="guest-hero-title">
                    Are you scoring below 600 in mock tests?
                </h1>
                <p className="guest-hero-desc">
                    Don't guess what's wrong. Take our 10-minute AI diagnostic test to find the exact chapter destroying your NEET score.
                </p>
                <div className="guest-hero-actions">
                    <Link href="/test/diagnostic">
                        <Button size="lg" variant="primary">Find My Weakest Chapter →</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="lg" variant="secondary">Create Free Account</Button>
                    </Link>
                </div>
            </div>

            {/* Social Proof */}
            <div className="grid grid-3 guest-proof-grid">
                {[
                    { value: '12,400+', label: 'Tests Generated', icon: <Icon name="FileText" size={28} color="#6366f1" /> },
                    { value: 'Gemini AI', label: 'Powered By Google', icon: <Icon name="Brain" size={28} color="#a855f7" /> },
                    { value: '4.6 ★', label: 'Play Store Rating', icon: <Icon name="Star" size={28} color="#eab308" /> },
                ].map((item, i) => (
                    <Card key={i} className="guest-proof-card">
                        <div className="guest-proof-icon">{item.icon}</div>
                        <div className="guest-proof-val">{item.value}</div>
                        <div className="guest-proof-label">{item.label}</div>
                    </Card>
                ))}
            </div>

            {/* Feature Preview */}
            <div className="guest-features">
                <h2 className="guest-features-title">
                    Everything you need to secure your rank.
                </h2>
                <div className="guest-features-list">
                    {[
                        { icon: <Icon name="FileText" size={28} color="#6366f1" />, title: 'Infinite AI Mock Tests', desc: 'Custom, adaptive, PYQ — all test types generated instantly.' },
                        { icon: <Icon name="MessageCircle" size={28} color="#10b981" />, title: '24/7 AI Doubt Solver', desc: 'Step-by-step NEET explanations tailored to your level.' },
                        { icon: <Icon name="BarChart2" size={28} color="#f43f5e" />, title: 'Performance Analytics', desc: 'Weak topics, accuracy trends, and rank prediction models.' },
                        { icon: <Icon name="Camera" size={28} color="#3b82f6" />, title: 'OMR Scanner', desc: 'Scan physical mock tests with your mobile camera instantly.' },
                    ].map((f, i) => (
                        <Card key={i} className="guest-feature-card">
                            <div className="guest-feature-icon">{f.icon}</div>
                            <div>
                                <h3 className="guest-feature-label">{f.title}</h3>
                                <p className="guest-feature-desc">{f.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* App Download CTA */}
            <Card className="guest-app-card">
                <h3 className="guest-app-title"><Icon name="Star" size={16} /> Study seamlessly on mobile</h3>
                <p className="guest-app-desc">
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
            <div className="page landing-wrapper">
                {/* Header skeleton */}
                <div className="landing-header">
                    <div>
                        <Skeleton style={{ width: 220, height: 32, marginBottom: 8 }} />
                        <Skeleton style={{ width: 180, height: 18 }} />
                    </div>
                    <Skeleton style={{ width: 120, height: 28, }} />
                </div>

                {/* Countdown card skeleton */}
                <Skeleton style={{ height: 120, marginBottom: 32, }} />

                {/* Stats grid skeleton */}
                <div className="grid grid-3 landing-stats-grid">
                    <Skeleton style={{ height: 90 }} />
                    <Skeleton style={{ height: 90 }} />
                    <Skeleton style={{ height: 90 }} />
                </div>

                {/* CTA skeleton */}
                <Skeleton style={{ height: 80, marginBottom: 40, }} />

                {/* Quick tools skeleton */}
                <Skeleton style={{ width: 100, height: 16, marginBottom: 16 }} />
                <div className="grid grid-2">
                    <Skeleton style={{ height: 100 }} />
                    <Skeleton style={{ height: 100 }} />
                    <Skeleton style={{ height: 100 }} />
                    <Skeleton style={{ height: 100 }} />
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
